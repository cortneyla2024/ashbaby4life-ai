"""
CareConnect v5.0 - The Steward AI Engine
Prediction script for the CareConnect model
"""

import torch
import torch.nn.functional as F
import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
from pathlib import Path
import argparse
import time
import threading
from queue import Queue
import signal
import sys

from model import CareConnectModel, CareConnectConfig, CareConnectAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CareConnectPredictor:
    """Real-time prediction interface for CareConnect AI"""
    
    def __init__(self, model_path: str = "checkpoints/steward-v5.pt", config_path: str = "config/model_config.json"):
        self.model_path = model_path
        self.config = CareConnectConfig(config_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Initialize AI system
        self.ai = CareConnectAI(model_path, config_path)
        
        # Prediction queue for batch processing
        self.prediction_queue = Queue()
        self.results_queue = Queue()
        
        # Performance tracking
        self.performance_stats = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_response_time": 0.0,
            "total_response_time": 0.0
        }
        
        # Threading for background processing
        self.processing_thread = None
        self.running = False
        
        logger.info(f"Predictor initialized on device: {self.device}")
    
    def start_background_processing(self):
        """Start background processing thread"""
        if not self.running:
            self.running = True
            self.processing_thread = threading.Thread(target=self._process_queue, daemon=True)
            self.processing_thread.start()
            logger.info("Background processing started")
    
    def stop_background_processing(self):
        """Stop background processing thread"""
        self.running = False
        if self.processing_thread:
            self.processing_thread.join()
            logger.info("Background processing stopped")
    
    def _process_queue(self):
        """Background thread for processing prediction queue"""
        while self.running:
            try:
                # Get batch of requests
                batch_requests = []
                batch_start_time = time.time()
                
                # Collect requests for batch processing
                while len(batch_requests) < 10 and time.time() - batch_start_time < 0.1:
                    try:
                        request = self.prediction_queue.get(timeout=0.01)
                        batch_requests.append(request)
                    except:
                        break
                
                if batch_requests:
                    # Process batch
                    batch_results = self._process_batch(batch_requests)
                    
                    # Return results
                    for request, result in zip(batch_requests, batch_results):
                        self.results_queue.put((request['id'], result))
                
            except Exception as e:
                logger.error(f"Error in background processing: {e}")
    
    def _process_batch(self, requests: List[Dict]) -> List[Dict]:
        """Process a batch of prediction requests"""
        results = []
        
        for request in requests:
            try:
                start_time = time.time()
                
                # Process request
                response = self._process_single_request(request)
                
                # Update performance stats
                response_time = time.time() - start_time
                self._update_performance_stats(response_time, True)
                
                results.append({
                    'success': True,
                    'response': response,
                    'response_time': response_time,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Error processing request {request.get('id', 'unknown')}: {e}")
                self._update_performance_stats(0, False)
                
                results.append({
                    'success': False,
                    'error': str(e),
                    'response_time': 0,
                    'timestamp': datetime.now().isoformat()
                })
        
        return results
    
    def _process_single_request(self, request: Dict) -> str:
        """Process a single prediction request"""
        input_text = request.get('text', '')
        max_length = request.get('max_length', 100)
        temperature = request.get('temperature', 0.7)
        
        # Generate response
        response = self.ai.process_text(input_text, max_length, temperature)
        
        return response
    
    def _update_performance_stats(self, response_time: float, success: bool):
        """Update performance statistics"""
        self.performance_stats['total_requests'] += 1
        
        if success:
            self.performance_stats['successful_requests'] += 1
            self.performance_stats['total_response_time'] += response_time
            self.performance_stats['average_response_time'] = (
                self.performance_stats['total_response_time'] / 
                self.performance_stats['successful_requests']
            )
        else:
            self.performance_stats['failed_requests'] += 1
    
    def predict(self, text: str, max_length: int = 100, temperature: float = 0.7, 
               request_id: Optional[str] = None) -> Dict:
        """Make a prediction (synchronous)"""
        try:
            start_time = time.time()
            
            # Generate response
            response = self.ai.process_text(text, max_length, temperature)
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Update performance stats
            self._update_performance_stats(response_time, True)
            
            result = {
                'success': True,
                'response': response,
                'response_time': response_time,
                'request_id': request_id,
                'timestamp': datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            self._update_performance_stats(0, False)
            
            return {
                'success': False,
                'error': str(e),
                'response_time': 0,
                'request_id': request_id,
                'timestamp': datetime.now().isoformat()
            }
    
    def predict_async(self, text: str, max_length: int = 100, temperature: float = 0.7) -> str:
        """Make a prediction asynchronously"""
        request_id = f"req_{int(time.time() * 1000)}"
        
        request = {
            'id': request_id,
            'text': text,
            'max_length': max_length,
            'temperature': temperature
        }
        
        # Add to queue
        self.prediction_queue.put(request)
        
        return request_id
    
    def get_async_result(self, request_id: str, timeout: float = 30.0) -> Optional[Dict]:
        """Get result from async prediction"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                # Check if result is available
                while not self.results_queue.empty():
                    result_id, result = self.results_queue.get_nowait()
                    if result_id == request_id:
                        return result
                
                time.sleep(0.01)  # Small delay
                
            except Exception as e:
                logger.error(f"Error getting async result: {e}")
                break
        
        return None
    
    def get_suggestions(self, context: str, num_suggestions: int = 3) -> List[str]:
        """Get conversation suggestions"""
        try:
            return self.ai.get_suggestions(context, num_suggestions)
        except Exception as e:
            logger.error(f"Error getting suggestions: {e}")
            return ["How can I help you today?"]
    
    def get_performance_stats(self) -> Dict:
        """Get current performance statistics"""
        stats = self.performance_stats.copy()
        
        # Add additional metrics
        stats['success_rate'] = (
            stats['successful_requests'] / max(stats['total_requests'], 1)
        )
        stats['requests_per_minute'] = (
            stats['total_requests'] / max((time.time() - self._start_time), 1) * 60
        )
        
        return stats
    
    def reset_performance_stats(self):
        """Reset performance statistics"""
        self.performance_stats = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_response_time": 0.0,
            "total_response_time": 0.0
        }
        self._start_time = time.time()
    
    def health_check(self) -> Dict:
        """Perform health check on the predictor"""
        try:
            # Test basic prediction
            test_result = self.predict("Hello", max_length=10)
            
            health_status = {
                'status': 'healthy' if test_result['success'] else 'unhealthy',
                'model_loaded': True,
                'device': str(self.device),
                'memory_usage': 0.0,
                'last_test': datetime.now().isoformat(),
                'test_result': test_result
            }
            
            # Check memory usage
            if torch.cuda.is_available():
                health_status['memory_usage'] = torch.cuda.memory_allocated() / 1024**3
            
            return health_status
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'last_test': datetime.now().isoformat()
            }

class PredictionServer:
    """Simple prediction server for handling multiple requests"""
    
    def __init__(self, predictor: CareConnectPredictor, port: int = 5001):
        self.predictor = predictor
        self.port = port
        self.running = False
        
    def start(self):
        """Start the prediction server"""
        try:
            from flask import Flask, request, jsonify
            
            app = Flask(__name__)
            
            @app.route('/predict', methods=['POST'])
            def predict():
                try:
                    data = request.get_json()
                    text = data.get('text', '')
                    max_length = data.get('max_length', 100)
                    temperature = data.get('temperature', 0.7)
                    
                    result = self.predictor.predict(text, max_length, temperature)
                    return jsonify(result)
                    
                except Exception as e:
                    return jsonify({'error': str(e)}), 500
            
            @app.route('/suggestions', methods=['POST'])
            def suggestions():
                try:
                    data = request.get_json()
                    context = data.get('context', '')
                    num_suggestions = data.get('num_suggestions', 3)
                    
                    suggestions = self.predictor.get_suggestions(context, num_suggestions)
                    return jsonify({'suggestions': suggestions})
                    
                except Exception as e:
                    return jsonify({'error': str(e)}), 500
            
            @app.route('/health', methods=['GET'])
            def health():
                health_status = self.predictor.health_check()
                return jsonify(health_status)
            
            @app.route('/stats', methods=['GET'])
            def stats():
                stats = self.predictor.get_performance_stats()
                return jsonify(stats)
            
            self.running = True
            logger.info(f"Prediction server starting on port {self.port}")
            app.run(host='0.0.0.0', port=self.port)
            
        except ImportError:
            logger.error("Flask not available. Install with: pip install flask")
        except Exception as e:
            logger.error(f"Error starting prediction server: {e}")
    
    def stop(self):
        """Stop the prediction server"""
        self.running = False
        logger.info("Prediction server stopped")

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info("Received shutdown signal")
    sys.exit(0)

def main():
    """Main prediction function"""
    parser = argparse.ArgumentParser(description="CareConnect AI Prediction Interface")
    parser.add_argument("--model", type=str, default="checkpoints/steward-v5.pt", help="Model path")
    parser.add_argument("--config", type=str, default="config/model_config.json", help="Config path")
    parser.add_argument("--server", action="store_true", help="Start prediction server")
    parser.add_argument("--port", type=int, default=5001, help="Server port")
    parser.add_argument("--interactive", action="store_true", help="Interactive mode")
    
    args = parser.parse_args()
    
    # Set up signal handler
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Initialize predictor
    predictor = CareConnectPredictor(args.model, args.config)
    
    # Start background processing
    predictor.start_background_processing()
    
    try:
        if args.server:
            # Start prediction server
            server = PredictionServer(predictor, args.port)
            server.start()
        
        elif args.interactive:
            # Interactive mode
            print("CareConnect AI Prediction Interface")
            print("Type 'quit' to exit, 'stats' for performance stats, 'health' for health check")
            print("-" * 50)
            
            while True:
                try:
                    user_input = input("You: ").strip()
                    
                    if user_input.lower() == 'quit':
                        break
                    elif user_input.lower() == 'stats':
                        stats = predictor.get_performance_stats()
                        print(f"Performance Stats: {stats}")
                        continue
                    elif user_input.lower() == 'health':
                        health = predictor.health_check()
                        print(f"Health Status: {health}")
                        continue
                    elif not user_input:
                        continue
                    
                    # Make prediction
                    result = predictor.predict(user_input)
                    
                    if result['success']:
                        print(f"AI: {result['response']}")
                        print(f"Response time: {result['response_time']:.3f}s")
                    else:
                        print(f"Error: {result['error']}")
                    
                    # Get suggestions
                    suggestions = predictor.get_suggestions(user_input)
                    print(f"Suggestions: {suggestions}")
                    print()
                    
                except KeyboardInterrupt:
                    break
                except Exception as e:
                    print(f"Error: {e}")
        
        else:
            # Single prediction mode
            print("CareConnect AI - Single Prediction Mode")
            print("Enter your message:")
            
            user_input = input().strip()
            if user_input:
                result = predictor.predict(user_input)
                
                if result['success']:
                    print(f"Response: {result['response']}")
                    print(f"Response time: {result['response_time']:.3f}s")
                else:
                    print(f"Error: {result['error']}")
    
    finally:
        # Cleanup
        predictor.stop_background_processing()
        logger.info("Prediction interface shutdown complete")

if __name__ == "__main__":
    main()
