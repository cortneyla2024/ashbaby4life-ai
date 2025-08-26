# =============================================================================
# CareConnect v5.0 - AI Prediction Script
# =============================================================================

import torch
import torch.nn.functional as F
import numpy as np
import json
import os
import time
import logging
from typing import List, Dict, Any, Optional, Tuple
import argparse
from datetime import datetime
import yaml

from model import CareConnectModel, ModelConfig, SimpleTokenizer

# =============================================================================
# Configuration
# =============================================================================

def load_prediction_config(config_path: str = "config.yaml") -> Dict[str, Any]:
    """Load prediction configuration from file."""
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        return config.get('ai_engine', {}).get('prediction', {})
    else:
        return {
            'max_length': 100,
            'temperature': 0.7,
            'top_p': 0.9,
            'top_k': 50,
            'num_beams': 1,
            'do_sample': True,
            'repetition_penalty': 1.1,
            'length_penalty': 1.0,
            'no_repeat_ngram_size': 3,
            'early_stopping': True,
            'pad_token_id': 0,
            'eos_token_id': 2,
            'batch_size': 1
        }

# =============================================================================
# Prediction Classes
# =============================================================================

class PredictionEngine:
    """Main prediction engine for CareConnect AI."""
    
    def __init__(self, model: CareConnectModel, config: Dict[str, Any]):
        self.model = model
        self.config = config
        self.device = model.device
        self.tokenizer = model.tokenizer
        
        # Initialize prediction history
        self.prediction_history = []
        self.user_sessions = {}
        
    def predict(self, user_id: str, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate a prediction for a user message."""
        
        start_time = time.time()
        
        if context is None:
            context = {}
        
        try:
            # Generate response using the model
            response = self.model.generate_response(user_id, message, context)
            
            # Calculate prediction time
            prediction_time = time.time() - start_time
            
            # Create prediction result
            result = {
                'user_id': user_id,
                'input_message': message,
                'response': response,
                'prediction_time': prediction_time,
                'timestamp': datetime.now().isoformat(),
                'context': context,
                'model_config': {
                    'temperature': self.config.get('temperature', 0.7),
                    'max_length': self.config.get('max_length', 100),
                    'top_p': self.config.get('top_p', 0.9),
                    'top_k': self.config.get('top_k', 50)
                }
            }
            
            # Store in history
            self.prediction_history.append(result)
            
            # Update user session
            if user_id not in self.user_sessions:
                self.user_sessions[user_id] = []
            self.user_sessions[user_id].append(result)
            
            # Limit history size
            if len(self.prediction_history) > 1000:
                self.prediction_history = self.prediction_history[-1000:]
            
            if len(self.user_sessions[user_id]) > 100:
                self.user_sessions[user_id] = self.user_sessions[user_id][-100:]
            
            return result
            
        except Exception as e:
            logging.error(f"Prediction error for user {user_id}: {e}")
            return {
                'user_id': user_id,
                'input_message': message,
                'response': f"I apologize, but I encountered an error: {str(e)}",
                'prediction_time': time.time() - start_time,
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'context': context
            }
    
    def batch_predict(self, predictions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate predictions for multiple inputs in batch."""
        
        results = []
        
        for pred_request in predictions:
            user_id = pred_request.get('user_id', 'batch_user')
            message = pred_request.get('message', '')
            context = pred_request.get('context', {})
            
            result = self.predict(user_id, message, context)
            results.append(result)
        
        return results
    
    def get_user_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get prediction history for a specific user."""
        if user_id in self.user_sessions:
            return self.user_sessions[user_id][-limit:]
        return []
    
    def get_prediction_stats(self) -> Dict[str, Any]:
        """Get statistics about predictions."""
        if not self.prediction_history:
            return {}
        
        prediction_times = [pred['prediction_time'] for pred in self.prediction_history]
        response_lengths = [len(pred['response'].split()) for pred in self.prediction_history]
        
        return {
            'total_predictions': len(self.prediction_history),
            'unique_users': len(self.user_sessions),
            'avg_prediction_time': np.mean(prediction_times),
            'min_prediction_time': np.min(prediction_times),
            'max_prediction_time': np.max(prediction_times),
            'avg_response_length': np.mean(response_lengths),
            'min_response_length': np.min(response_lengths),
            'max_response_length': np.max(response_lengths)
        }
    
    def save_history(self, file_path: str):
        """Save prediction history to file."""
        with open(file_path, 'w') as f:
            json.dump({
                'prediction_history': self.prediction_history,
                'user_sessions': self.user_sessions,
                'stats': self.get_prediction_stats(),
                'timestamp': datetime.now().isoformat()
            }, f, indent=2)
    
    def load_history(self, file_path: str):
        """Load prediction history from file."""
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data = json.load(f)
                self.prediction_history = data.get('prediction_history', [])
                self.user_sessions = data.get('user_sessions', {})

# =============================================================================
# Advanced Prediction Methods
# =============================================================================

class AdvancedPredictionEngine(PredictionEngine):
    """Advanced prediction engine with additional features."""
    
    def __init__(self, model: CareConnectModel, config: Dict[str, Any]):
        super().__init__(model, config)
        self.response_templates = self._load_response_templates()
        self.sentiment_analyzer = self._initialize_sentiment_analyzer()
    
    def _load_response_templates(self) -> Dict[str, List[str]]:
        """Load response templates for different contexts."""
        return {
            'greeting': [
                "Hello! How can I help you today?",
                "Hi there! What's on your mind?",
                "Welcome! How are you feeling?"
            ],
            'farewell': [
                "Take care! Feel free to reach out anytime.",
                "Goodbye! Remember, I'm here when you need me.",
                "See you later! Stay well."
            ],
            'encouragement': [
                "You're doing great! Keep going.",
                "I believe in you! You've got this.",
                "You're making progress! Don't give up."
            ],
            'empathy': [
                "I understand how you feel.",
                "That sounds challenging.",
                "I'm here to support you."
            ]
        }
    
    def _initialize_sentiment_analyzer(self):
        """Initialize sentiment analyzer."""
        try:
            from textblob import TextBlob
            return TextBlob
        except ImportError:
            logging.warning("TextBlob not available, sentiment analysis disabled")
            return None
    
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment of text."""
        if self.sentiment_analyzer is None:
            return {'polarity': 0.0, 'subjectivity': 0.0}
        
        try:
            blob = self.sentiment_analyzer(text)
            return {
                'polarity': blob.sentiment.polarity,
                'subjectivity': blob.sentiment.subjectivity
            }
        except Exception as e:
            logging.error(f"Sentiment analysis error: {e}")
            return {'polarity': 0.0, 'subjectivity': 0.0}
    
    def predict_with_sentiment(self, user_id: str, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate prediction with sentiment analysis."""
        
        # Analyze input sentiment
        input_sentiment = self.analyze_sentiment(message)
        
        # Generate base prediction
        result = self.predict(user_id, message, context)
        
        # Add sentiment information
        result['input_sentiment'] = input_sentiment
        
        # Analyze response sentiment
        response_sentiment = self.analyze_sentiment(result['response'])
        result['response_sentiment'] = response_sentiment
        
        return result
    
    def predict_with_context_awareness(self, user_id: str, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate prediction with enhanced context awareness."""
        
        if context is None:
            context = {}
        
        # Get user history
        user_history = self.get_user_history(user_id, limit=5)
        
        # Analyze conversation context
        conversation_context = self._analyze_conversation_context(user_history, message)
        
        # Update context with conversation analysis
        context.update(conversation_context)
        
        # Generate prediction
        result = self.predict(user_id, message, context)
        
        # Add context information
        result['conversation_context'] = conversation_context
        
        return result
    
    def _analyze_conversation_context(self, user_history: List[Dict[str, Any]], current_message: str) -> Dict[str, Any]:
        """Analyze conversation context from user history."""
        
        if not user_history:
            return {}
        
        # Analyze recent messages
        recent_messages = [entry['input_message'] for entry in user_history[-3:]]
        recent_responses = [entry['response'] for entry in user_history[-3:]]
        
        # Detect conversation topics
        topics = self._detect_topics(recent_messages + [current_message])
        
        # Analyze conversation flow
        conversation_flow = self._analyze_conversation_flow(user_history)
        
        # Detect user mood trends
        mood_trends = self._analyze_mood_trends(user_history)
        
        return {
            'recent_topics': topics,
            'conversation_flow': conversation_flow,
            'mood_trends': mood_trends,
            'conversation_length': len(user_history),
            'last_interaction_time': user_history[-1]['timestamp'] if user_history else None
        }
    
    def _detect_topics(self, messages: List[str]) -> List[str]:
        """Detect topics from messages."""
        # Simple topic detection - in production, use more sophisticated NLP
        topics = []
        
        topic_keywords = {
            'health': ['health', 'exercise', 'diet', 'sleep', 'stress', 'anxiety'],
            'work': ['work', 'job', 'career', 'project', 'meeting', 'deadline'],
            'relationships': ['relationship', 'family', 'friends', 'partner', 'love'],
            'learning': ['learn', 'study', 'course', 'skill', 'education'],
            'finance': ['money', 'finance', 'budget', 'saving', 'investment']
        }
        
        for message in messages:
            message_lower = message.lower()
            for topic, keywords in topic_keywords.items():
                if any(keyword in message_lower for keyword in keywords):
                    if topic not in topics:
                        topics.append(topic)
        
        return topics
    
    def _analyze_conversation_flow(self, user_history: List[Dict[str, Any]]) -> str:
        """Analyze the flow of conversation."""
        if len(user_history) < 2:
            return 'new_conversation'
        
        # Analyze message lengths
        message_lengths = [len(entry['input_message'].split()) for entry in user_history[-5:]]
        
        if len(message_lengths) >= 3:
            # Check if conversation is getting longer (more engagement)
            if message_lengths[-1] > np.mean(message_lengths[:-1]):
                return 'increasing_engagement'
            elif message_lengths[-1] < np.mean(message_lengths[:-1]):
                return 'decreasing_engagement'
        
        return 'stable_conversation'
    
    def _analyze_mood_trends(self, user_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze mood trends from user history."""
        if not user_history:
            return {}
        
        # Analyze sentiment trends
        sentiments = []
        for entry in user_history[-5:]:
            if 'input_sentiment' in entry:
                sentiments.append(entry['input_sentiment']['polarity'])
        
        if sentiments:
            return {
                'current_mood': 'positive' if sentiments[-1] > 0 else 'negative' if sentiments[-1] < 0 else 'neutral',
                'mood_trend': 'improving' if len(sentiments) >= 2 and sentiments[-1] > sentiments[-2] else 'stable',
                'avg_sentiment': np.mean(sentiments)
            }
        
        return {}

# =============================================================================
# Interactive Prediction Interface
# =============================================================================

class InteractivePredictor:
    """Interactive command-line interface for predictions."""
    
    def __init__(self, prediction_engine: PredictionEngine):
        self.engine = prediction_engine
        self.current_user = "interactive_user"
        self.running = True
    
    def start(self):
        """Start interactive prediction session."""
        print("=" * 60)
        print("CareConnect v5.0 - Interactive AI Assistant")
        print("=" * 60)
        print("Type 'quit' to exit, 'help' for commands, 'stats' for statistics")
        print("Type your message and press Enter to get a response")
        print("-" * 60)
        
        while self.running:
            try:
                # Get user input
                user_input = input(f"[{self.current_user}]> ").strip()
                
                if not user_input:
                    continue
                
                # Handle commands
                if user_input.lower() == 'quit':
                    self.running = False
                    continue
                elif user_input.lower() == 'help':
                    self._show_help()
                    continue
                elif user_input.lower() == 'stats':
                    self._show_stats()
                    continue
                elif user_input.lower() == 'history':
                    self._show_history()
                    continue
                elif user_input.lower().startswith('user '):
                    self._change_user(user_input[5:])
                    continue
                
                # Generate prediction
                result = self.engine.predict(self.current_user, user_input)
                
                # Display response
                print(f"\n[Assistant]: {result['response']}")
                print(f"[Time: {result['prediction_time']:.3f}s]")
                print("-" * 60)
                
            except KeyboardInterrupt:
                print("\n\nGoodbye!")
                self.running = False
            except Exception as e:
                print(f"\nError: {e}")
    
    def _show_help(self):
        """Show help information."""
        help_text = """
Available Commands:
- quit: Exit the interactive session
- help: Show this help message
- stats: Show prediction statistics
- history: Show recent conversation history
- user <name>: Change current user

Just type your message to get an AI response!
        """
        print(help_text)
    
    def _show_stats(self):
        """Show prediction statistics."""
        stats = self.engine.get_prediction_stats()
        if stats:
            print("\nPrediction Statistics:")
            print(f"- Total predictions: {stats['total_predictions']}")
            print(f"- Unique users: {stats['unique_users']}")
            print(f"- Average prediction time: {stats['avg_prediction_time']:.3f}s")
            print(f"- Average response length: {stats['avg_response_length']:.1f} words")
        else:
            print("No prediction statistics available.")
    
    def _show_history(self):
        """Show recent conversation history."""
        history = self.engine.get_user_history(self.current_user, limit=5)
        if history:
            print(f"\nRecent conversation history for {self.current_user}:")
            for i, entry in enumerate(history[-5:], 1):
                print(f"{i}. You: {entry['input_message'][:50]}...")
                print(f"   Assistant: {entry['response'][:50]}...")
                print()
        else:
            print("No conversation history available.")
    
    def _change_user(self, new_user: str):
        """Change current user."""
        self.current_user = new_user
        print(f"Switched to user: {new_user}")

# =============================================================================
# Batch Prediction Utilities
# =============================================================================

def batch_predict_from_file(input_file: str, output_file: str, prediction_engine: PredictionEngine):
    """Run batch predictions from input file."""
    
    # Load input data
    with open(input_file, 'r') as f:
        input_data = json.load(f)
    
    # Generate predictions
    results = prediction_engine.batch_predict(input_data)
    
    # Save results
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Batch prediction completed. Results saved to {output_file}")
    print(f"Processed {len(results)} predictions")

# =============================================================================
# Main Functions
# =============================================================================

def main():
    """Main prediction execution."""
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='CareConnect v5.0 AI Prediction')
    parser.add_argument('--config', type=str, default='config.yaml', help='Configuration file path')
    parser.add_argument('--model-path', type=str, default='checkpoints/steward-v5.pt', help='Model checkpoint path')
    parser.add_argument('--interactive', action='store_true', help='Start interactive mode')
    parser.add_argument('--input-file', type=str, help='Input file for batch prediction')
    parser.add_argument('--output-file', type=str, help='Output file for batch prediction')
    parser.add_argument('--message', type=str, help='Single message to predict')
    parser.add_argument('--user-id', type=str, default='default_user', help='User ID for prediction')
    parser.add_argument('--advanced', action='store_true', help='Use advanced prediction features')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/prediction.log'),
            logging.StreamHandler()
        ]
    )
    
    # Load configuration
    config = load_prediction_config(args.config)
    logging.info(f"Prediction configuration: {config}")
    
    # Create model
    model_config = ModelConfig()
    model_config.model_path = args.model_path
    model = CareConnectModel(model_config)
    logging.info(f"Model loaded on device: {model.device}")
    
    # Create prediction engine
    if args.advanced:
        prediction_engine = AdvancedPredictionEngine(model, config)
        logging.info("Using advanced prediction engine")
    else:
        prediction_engine = PredictionEngine(model, config)
        logging.info("Using standard prediction engine")
    
    # Load history if exists
    history_file = 'prediction_history.json'
    if os.path.exists(history_file):
        prediction_engine.load_history(history_file)
        logging.info("Loaded prediction history")
    
    try:
        # Handle different modes
        if args.interactive:
            # Interactive mode
            interactive = InteractivePredictor(prediction_engine)
            interactive.start()
        
        elif args.input_file and args.output_file:
            # Batch prediction mode
            batch_predict_from_file(args.input_file, args.output_file, prediction_engine)
        
        elif args.message:
            # Single prediction mode
            result = prediction_engine.predict(args.user_id, args.message)
            print(f"Input: {result['input_message']}")
            print(f"Response: {result['response']}")
            print(f"Time: {result['prediction_time']:.3f}s")
        
        else:
            # Default to interactive mode
            print("No specific mode specified, starting interactive mode...")
            interactive = InteractivePredictor(prediction_engine)
            interactive.start()
    
    finally:
        # Save history
        prediction_engine.save_history(history_file)
        logging.info("Saved prediction history")

if __name__ == "__main__":
    main()
