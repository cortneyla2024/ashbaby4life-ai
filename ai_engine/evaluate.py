"""
CareConnect v5.0 - The Steward AI Engine
Evaluation script for the CareConnect model
"""

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import numpy as np
from pathlib import Path
import argparse
from tqdm import tqdm
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

from model import CareConnectModel, CareConnectConfig, CareConnectAI
from train import CareConnectDataset

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CareConnectEvaluator:
    """Evaluator class for CareConnect AI model"""
    
    def __init__(self, model_path: str, config_path: str = "config/model_config.json"):
        self.model_path = model_path
        self.config = CareConnectConfig(config_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load model
        self.model = CareConnectModel(self.config).to(self.device)
        self.load_model()
        
        # Initialize AI system for tokenizer
        self.ai = CareConnectAI()
        
        # Evaluation metrics
        self.metrics = {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "perplexity": 0.0,
            "response_time": 0.0,
            "memory_usage": 0.0
        }
        
        logger.info(f"Evaluator initialized on device: {self.device}")
    
    def load_model(self):
        """Load the trained model"""
        try:
            if os.path.exists(self.model_path):
                checkpoint = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(checkpoint['model_state_dict'])
                logger.info(f"Model loaded from {self.model_path}")
            else:
                logger.error(f"Model not found at {self.model_path}")
                raise FileNotFoundError(f"Model not found at {self.model_path}")
            
            self.model.eval()
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def evaluate_dataset(self, test_data_path: str) -> Dict:
        """Evaluate model on test dataset"""
        logger.info("Starting model evaluation")
        
        # Load test dataset
        test_dataset = CareConnectDataset(test_data_path, self.config.max_seq_length, self.ai.tokenizer)
        test_dataloader = DataLoader(test_dataset, batch_size=8, shuffle=False)
        
        # Initialize metrics
        total_loss = 0.0
        all_predictions = []
        all_targets = []
        response_times = []
        
        criterion = nn.CrossEntropyLoss(ignore_index=0, reduction='sum')
        
        self.model.eval()
        with torch.no_grad():
            for batch in tqdm(test_dataloader, desc="Evaluating"):
                input_ids = batch["input_ids"].to(self.device)
                output_ids = batch["output_ids"].to(self.device)
                attention_mask = batch["attention_mask"].to(self.device)
                
                # Measure response time
                start_time = torch.cuda.Event(enable_timing=True) if torch.cuda.is_available() else None
                end_time = torch.cuda.Event(enable_timing=True) if torch.cuda.is_available() else None
                
                if start_time:
                    start_time.record()
                
                # Forward pass
                logits = self.model(input_ids, attention_mask)
                
                if end_time:
                    end_time.record()
                    torch.cuda.synchronize()
                    response_times.append(start_time.elapsed_time(end_time))
                
                # Calculate loss
                loss = criterion(
                    logits.view(-1, self.config.vocab_size),
                    output_ids.view(-1)
                )
                total_loss += loss.item()
                
                # Get predictions
                predictions = torch.argmax(logits, dim=-1)
                
                # Convert to lists for metrics calculation
                for pred, target in zip(predictions.cpu().numpy(), output_ids.cpu().numpy()):
                    # Remove padding tokens
                    pred = pred[target != 0]
                    target = target[target != 0]
                    
                    all_predictions.extend(pred)
                    all_targets.extend(target)
        
        # Calculate metrics
        self.calculate_metrics(all_predictions, all_targets, total_loss, response_times)
        
        return self.metrics
    
    def calculate_metrics(self, predictions: List[int], targets: List[int], 
                         total_loss: float, response_times: List[float]):
        """Calculate evaluation metrics"""
        try:
            # Accuracy
            self.metrics["accuracy"] = accuracy_score(targets, predictions)
            
            # Precision, Recall, F1-Score
            precision, recall, f1, _ = precision_recall_fscore_support(
                targets, predictions, average='weighted', zero_division=0
            )
            self.metrics["precision"] = precision
            self.metrics["recall"] = recall
            self.metrics["f1_score"] = f1
            
            # Perplexity
            total_tokens = len(targets)
            self.metrics["perplexity"] = np.exp(total_loss / total_tokens)
            
            # Response time
            if response_times:
                self.metrics["response_time"] = np.mean(response_times)
            
            # Memory usage
            if torch.cuda.is_available():
                self.metrics["memory_usage"] = torch.cuda.max_memory_allocated() / 1024**3  # GB
            
            logger.info("Metrics calculated successfully")
            
        except Exception as e:
            logger.error(f"Error calculating metrics: {e}")
    
    def evaluate_conversation_quality(self, test_conversations: List[Dict]) -> Dict:
        """Evaluate conversation quality metrics"""
        logger.info("Evaluating conversation quality")
        
        quality_metrics = {
            "relevance_score": 0.0,
            "coherence_score": 0.0,
            "helpfulness_score": 0.0,
            "ethical_compliance": 1.0,
            "response_length": 0.0,
            "response_diversity": 0.0
        }
        
        total_responses = len(test_conversations)
        response_lengths = []
        response_texts = []
        
        for conversation in test_conversations:
            input_text = conversation["input"]
            expected_output = conversation["output"]
            
            # Generate response
            try:
                generated_response = self.ai.process_text(input_text)
                response_lengths.append(len(generated_response.split()))
                response_texts.append(generated_response)
                
                # Simple relevance check (keyword overlap)
                input_words = set(input_text.lower().split())
                response_words = set(generated_response.lower().split())
                overlap = len(input_words.intersection(response_words))
                quality_metrics["relevance_score"] += overlap / max(len(input_words), 1)
                
                # Check for ethical compliance
                if any(harmful_word in generated_response.lower() for harmful_word in 
                       ["harmful", "dangerous", "illegal", "hate", "violence"]):
                    quality_metrics["ethical_compliance"] -= 1.0 / total_responses
                
            except Exception as e:
                logger.warning(f"Error generating response: {e}")
                continue
        
        # Calculate average metrics
        if total_responses > 0:
            quality_metrics["relevance_score"] /= total_responses
            quality_metrics["response_length"] = np.mean(response_lengths)
            
            # Calculate response diversity (unique words ratio)
            all_words = set()
            total_words = 0
            for response in response_texts:
                words = response.lower().split()
                all_words.update(words)
                total_words += len(words)
            
            if total_words > 0:
                quality_metrics["response_diversity"] = len(all_words) / total_words
        
        return quality_metrics
    
    def generate_evaluation_report(self, output_path: str = "logs/evaluation_report.json"):
        """Generate comprehensive evaluation report"""
        logger.info("Generating evaluation report")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "model_info": {
                "path": self.model_path,
                "config": self.config.__dict__,
                "device": str(self.device)
            },
            "metrics": self.metrics,
            "summary": self.generate_summary(),
            "recommendations": self.generate_recommendations()
        }
        
        # Save report
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Evaluation report saved to {output_path}")
        return report
    
    def generate_summary(self) -> Dict:
        """Generate evaluation summary"""
        summary = {
            "overall_performance": "Good" if self.metrics["accuracy"] > 0.7 else "Needs Improvement",
            "key_strengths": [],
            "areas_for_improvement": [],
            "model_health": "Healthy" if self.metrics["perplexity"] < 10 else "Needs Attention"
        }
        
        # Identify strengths
        if self.metrics["accuracy"] > 0.8:
            summary["key_strengths"].append("High accuracy")
        if self.metrics["f1_score"] > 0.8:
            summary["key_strengths"].append("Good F1 score")
        if self.metrics["response_time"] < 100:
            summary["key_strengths"].append("Fast response time")
        
        # Identify areas for improvement
        if self.metrics["accuracy"] < 0.7:
            summary["areas_for_improvement"].append("Improve accuracy")
        if self.metrics["perplexity"] > 10:
            summary["areas_for_improvement"].append("Reduce perplexity")
        if self.metrics["response_time"] > 200:
            summary["areas_for_improvement"].append("Optimize response time")
        
        return summary
    
    def generate_recommendations(self) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        if self.metrics["accuracy"] < 0.7:
            recommendations.append("Increase training data diversity")
            recommendations.append("Adjust model architecture")
            recommendations.append("Fine-tune hyperparameters")
        
        if self.metrics["perplexity"] > 10:
            recommendations.append("Improve training data quality")
            recommendations.append("Increase model capacity")
            recommendations.append("Optimize training process")
        
        if self.metrics["response_time"] > 200:
            recommendations.append("Optimize model inference")
            recommendations.append("Consider model quantization")
            recommendations.append("Implement caching mechanisms")
        
        if not recommendations:
            recommendations.append("Model performance is satisfactory")
            recommendations.append("Continue monitoring for degradation")
        
        return recommendations
    
    def plot_metrics(self, output_path: str = "logs/metrics_plot.png"):
        """Generate metrics visualization"""
        try:
            # Create figure with subplots
            fig, axes = plt.subplots(2, 2, figsize=(12, 10))
            fig.suptitle('CareConnect AI Model Evaluation Metrics', fontsize=16)
            
            # Accuracy, Precision, Recall, F1
            metrics_names = ['Accuracy', 'Precision', 'Recall', 'F1 Score']
            metrics_values = [
                self.metrics["accuracy"],
                self.metrics["precision"],
                self.metrics["recall"],
                self.metrics["f1_score"]
            ]
            
            axes[0, 0].bar(metrics_names, metrics_values, color=['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'])
            axes[0, 0].set_title('Classification Metrics')
            axes[0, 0].set_ylim(0, 1)
            axes[0, 0].tick_params(axis='x', rotation=45)
            
            # Perplexity
            axes[0, 1].pie([self.metrics["perplexity"], 10], 
                          labels=['Current', 'Target'], 
                          colors=['#FF5722', '#E0E0E0'],
                          autopct='%1.1f')
            axes[0, 1].set_title('Perplexity Comparison')
            
            # Response Time
            axes[1, 0].bar(['Response Time (ms)'], [self.metrics["response_time"]], color='#607D8B')
            axes[1, 0].set_title('Response Time')
            axes[1, 0].axhline(y=100, color='red', linestyle='--', label='Target')
            axes[1, 0].legend()
            
            # Memory Usage
            axes[1, 1].bar(['Memory Usage (GB)'], [self.metrics["memory_usage"]], color='#795548')
            axes[1, 1].set_title('Memory Usage')
            
            plt.tight_layout()
            
            # Save plot
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            logger.info(f"Metrics plot saved to {output_path}")
            
        except Exception as e:
            logger.error(f"Error generating metrics plot: {e}")
    
    def benchmark_performance(self, num_samples: int = 100) -> Dict:
        """Benchmark model performance"""
        logger.info(f"Running performance benchmark with {num_samples} samples")
        
        benchmark_metrics = {
            "throughput": 0.0,  # samples per second
            "latency": 0.0,     # milliseconds per sample
            "memory_peak": 0.0, # peak memory usage in GB
            "cpu_usage": 0.0,   # average CPU usage
            "gpu_usage": 0.0    # average GPU usage
        }
        
        # Generate test samples
        test_inputs = [
            "Hello, how are you?",
            "What can you help me with?",
            "I need assistance with my health",
            "How do I manage my finances?",
            "I want to be more creative"
        ] * (num_samples // 5)
        
        start_time = datetime.now()
        
        for i, input_text in enumerate(test_inputs[:num_samples]):
            try:
                response = self.ai.process_text(input_text)
                if i % 10 == 0:
                    logger.info(f"Processed {i}/{num_samples} samples")
            except Exception as e:
                logger.warning(f"Error processing sample {i}: {e}")
        
        end_time = datetime.now()
        total_time = (end_time - start_time).total_seconds()
        
        # Calculate metrics
        benchmark_metrics["throughput"] = num_samples / total_time
        benchmark_metrics["latency"] = (total_time / num_samples) * 1000  # Convert to ms
        
        # Memory usage
        if torch.cuda.is_available():
            benchmark_metrics["memory_peak"] = torch.cuda.max_memory_allocated() / 1024**3
        
        logger.info(f"Benchmark completed: {benchmark_metrics['throughput']:.2f} samples/sec")
        return benchmark_metrics

def main():
    """Main evaluation function"""
    parser = argparse.ArgumentParser(description="Evaluate CareConnect AI model")
    parser.add_argument("--model", type=str, default="checkpoints/steward-v5.pt", help="Model path")
    parser.add_argument("--config", type=str, default="config/model_config.json", help="Config path")
    parser.add_argument("--test_data", type=str, default="data/test_data.json", help="Test data path")
    parser.add_argument("--output", type=str, default="logs/evaluation_report.json", help="Output report path")
    parser.add_argument("--plot", action="store_true", help="Generate metrics plot")
    parser.add_argument("--benchmark", action="store_true", help="Run performance benchmark")
    
    args = parser.parse_args()
    
    # Initialize evaluator
    evaluator = CareConnectEvaluator(args.model, args.config)
    
    # Run evaluation
    if os.path.exists(args.test_data):
        metrics = evaluator.evaluate_dataset(args.test_data)
        logger.info(f"Evaluation metrics: {metrics}")
    else:
        logger.warning(f"Test data not found at {args.test_data}")
    
    # Generate report
    report = evaluator.generate_evaluation_report(args.output)
    logger.info("Evaluation completed")
    
    # Generate plot if requested
    if args.plot:
        evaluator.plot_metrics()
    
    # Run benchmark if requested
    if args.benchmark:
        benchmark_results = evaluator.benchmark_performance()
        logger.info(f"Benchmark results: {benchmark_results}")

if __name__ == "__main__":
    main()
