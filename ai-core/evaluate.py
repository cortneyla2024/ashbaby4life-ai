# =============================================================================
# CareConnect v5.0 - AI Evaluation Script
# =============================================================================

import torch
import torch.nn as nn
import numpy as np
import json
import os
import time
import logging
from typing import List, Dict, Any, Tuple, Optional
from tqdm import tqdm
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from sklearn.manifold import TSNE
import pandas as pd
from datetime import datetime

from model import CareConnectModel, ModelConfig, SimpleTokenizer

# =============================================================================
# Configuration
# =============================================================================

def load_evaluation_config(config_path: str = "config.yaml") -> Dict[str, Any]:
    """Load evaluation configuration from file."""
    if os.path.exists(config_path):
        import yaml
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        return config.get('ai_engine', {}).get('evaluation', {})
    else:
        return {
            'batch_size': 8,
            'max_length': 2048,
            'temperature': 0.7,
            'top_p': 0.9,
            'top_k': 50,
            'num_samples': 100,
            'metrics': ['perplexity', 'accuracy', 'bleu', 'rouge'],
            'save_predictions': True,
            'generate_samples': True
        }

# =============================================================================
# Evaluation Metrics
# =============================================================================

class EvaluationMetrics:
    """Calculate and track evaluation metrics."""
    
    def __init__(self):
        self.metrics = {}
        self.predictions = []
        self.targets = []
        self.losses = []
        
    def add_prediction(self, prediction: str, target: str, loss: float = None):
        """Add a prediction-target pair."""
        self.predictions.append(prediction)
        self.targets.append(target)
        if loss is not None:
            self.losses.append(loss)
    
    def calculate_perplexity(self) -> float:
        """Calculate perplexity from losses."""
        if not self.losses:
            return float('inf')
        return np.exp(np.mean(self.losses))
    
    def calculate_accuracy(self) -> float:
        """Calculate exact match accuracy."""
        if not self.predictions or not self.targets:
            return 0.0
        
        correct = sum(1 for pred, target in zip(self.predictions, self.targets) 
                     if pred.strip().lower() == target.strip().lower())
        return correct / len(self.predictions)
    
    def calculate_bleu_score(self) -> float:
        """Calculate BLEU score."""
        try:
            from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
            from nltk.tokenize import word_tokenize
            
            smoothie = SmoothingFunction().method1
            total_bleu = 0
            
            for pred, target in zip(self.predictions, self.targets):
                pred_tokens = word_tokenize(pred.lower())
                target_tokens = word_tokenize(target.lower())
                
                # Calculate BLEU score
                bleu = sentence_bleu([target_tokens], pred_tokens, smoothing_function=smoothie)
                total_bleu += bleu
            
            return total_bleu / len(self.predictions)
        except ImportError:
            print("NLTK not available, skipping BLEU calculation")
            return 0.0
    
    def calculate_rouge_score(self) -> Dict[str, float]:
        """Calculate ROUGE scores."""
        try:
            from rouge_score import rouge_scorer
            
            scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
            rouge_scores = {'rouge1': 0, 'rouge2': 0, 'rougeL': 0}
            
            for pred, target in zip(self.predictions, self.targets):
                scores = scorer.score(target, pred)
                for metric in rouge_scores:
                    rouge_scores[metric] += scores[metric].fmeasure
            
            # Average scores
            for metric in rouge_scores:
                rouge_scores[metric] /= len(self.predictions)
            
            return rouge_scores
        except ImportError:
            print("rouge-score not available, skipping ROUGE calculation")
            return {'rouge1': 0.0, 'rouge2': 0.0, 'rougeL': 0.0}
    
    def calculate_semantic_similarity(self) -> float:
        """Calculate semantic similarity using sentence transformers."""
        try:
            from sentence_transformers import SentenceTransformer
            from sklearn.metrics.pairwise import cosine_similarity
            
            model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Encode sentences
            pred_embeddings = model.encode(self.predictions)
            target_embeddings = model.encode(self.targets)
            
            # Calculate cosine similarities
            similarities = []
            for pred_emb, target_emb in zip(pred_embeddings, target_embeddings):
                similarity = cosine_similarity([pred_emb], [target_emb])[0][0]
                similarities.append(similarity)
            
            return np.mean(similarities)
        except ImportError:
            print("sentence-transformers not available, skipping semantic similarity")
            return 0.0
    
    def calculate_all_metrics(self) -> Dict[str, Any]:
        """Calculate all available metrics."""
        metrics = {}
        
        # Basic metrics
        if self.losses:
            metrics['perplexity'] = self.calculate_perplexity()
        
        if self.predictions and self.targets:
            metrics['accuracy'] = self.calculate_accuracy()
            metrics['bleu'] = self.calculate_bleu_score()
            metrics['rouge'] = self.calculate_rouge_score()
            metrics['semantic_similarity'] = self.calculate_semantic_similarity()
        
        return metrics
    
    def save_results(self, save_path: str):
        """Save evaluation results to file."""
        results = {
            'metrics': self.calculate_all_metrics(),
            'predictions': self.predictions,
            'targets': self.targets,
            'losses': self.losses,
            'timestamp': datetime.now().isoformat()
        }
        
        with open(save_path, 'w') as f:
            json.dump(results, f, indent=2)

# =============================================================================
# Evaluation Functions
# =============================================================================

def evaluate_model(model: CareConnectModel, test_data: List[Dict[str, str]], 
                  config: Dict[str, Any]) -> EvaluationMetrics:
    """Evaluate the model on test data."""
    
    metrics = EvaluationMetrics()
    device = model.device
    
    print(f"Evaluating model on {len(test_data)} samples...")
    
    for i, item in enumerate(tqdm(test_data, desc="Evaluating")):
        input_text = item.get('input', '')
        target_text = item.get('target', '')
        
        try:
            # Generate prediction
            prediction = model.generate_response(
                user_id="evaluation",
                message=input_text,
                context={'evaluation_mode': True}
            )
            
            # Calculate loss if possible
            loss = None
            try:
                # Tokenize for loss calculation
                tokenizer = model.tokenizer
                input_ids = tokenizer.encode(input_text, return_tensors='pt').to(device)
                target_ids = tokenizer.encode(target_text, return_tensors='pt').to(device)
                
                with torch.no_grad():
                    outputs = model.transformer(input_ids)
                    loss_fct = nn.CrossEntropyLoss(ignore_index=-100)
                    
                    # Create labels for loss calculation
                    labels = target_ids.clone()
                    labels = labels[:, 1:]  # Shift for next token prediction
                    outputs = outputs[:, :-1, :]  # Remove last token
                    
                    loss = loss_fct(outputs.view(-1, outputs.size(-1)), labels.view(-1))
                    loss = loss.item()
            except Exception as e:
                print(f"Could not calculate loss for sample {i}: {e}")
            
            # Add to metrics
            metrics.add_prediction(prediction, target_text, loss)
            
        except Exception as e:
            print(f"Error evaluating sample {i}: {e}")
            continue
    
    return metrics

def generate_sample_responses(model: CareConnectModel, config: Dict[str, Any]) -> List[Dict[str, str]]:
    """Generate sample responses for qualitative evaluation."""
    
    sample_prompts = [
        "How are you feeling today?",
        "I'm feeling stressed about work",
        "Can you help me with my goals?",
        "I need motivation to exercise",
        "I'm having trouble sleeping",
        "What should I do about my relationship?",
        "I want to learn a new skill",
        "How can I improve my productivity?",
        "I'm feeling lonely",
        "What's the best way to manage my finances?"
    ]
    
    samples = []
    
    print("Generating sample responses...")
    for prompt in tqdm(sample_prompts, desc="Generating samples"):
        try:
            response = model.generate_response(
                user_id="sample_generation",
                message=prompt,
                context={'sample_generation': True}
            )
            
            samples.append({
                'prompt': prompt,
                'response': response,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            print(f"Error generating response for prompt '{prompt}': {e}")
            samples.append({
                'prompt': prompt,
                'response': f"Error: {str(e)}",
                'timestamp': datetime.now().isoformat()
            })
    
    return samples

# =============================================================================
# Visualization Functions
# =============================================================================

def plot_evaluation_results(metrics: EvaluationMetrics, save_dir: str = "evaluation_results"):
    """Create visualization plots for evaluation results."""
    
    os.makedirs(save_dir, exist_ok=True)
    
    # Create subplots
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # 1. Loss distribution
    if metrics.losses:
        axes[0, 0].hist(metrics.losses, bins=20, alpha=0.7, color='skyblue', edgecolor='black')
        axes[0, 0].set_title('Loss Distribution')
        axes[0, 0].set_xlabel('Loss')
        axes[0, 0].set_ylabel('Frequency')
        axes[0, 0].grid(True, alpha=0.3)
    
    # 2. Response length distribution
    pred_lengths = [len(pred.split()) for pred in metrics.predictions]
    target_lengths = [len(target.split()) for target in metrics.targets]
    
    axes[0, 1].hist(pred_lengths, bins=20, alpha=0.7, label='Predictions', color='lightcoral')
    axes[0, 1].hist(target_lengths, bins=20, alpha=0.7, label='Targets', color='lightgreen')
    axes[0, 1].set_title('Response Length Distribution')
    axes[0, 1].set_xlabel('Number of Words')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    
    # 3. Metrics comparison
    calculated_metrics = metrics.calculate_all_metrics()
    if calculated_metrics:
        metric_names = list(calculated_metrics.keys())
        metric_values = list(calculated_metrics.values())
        
        # Handle nested metrics (like ROUGE)
        flat_metrics = {}
        for name, value in calculated_metrics.items():
            if isinstance(value, dict):
                for sub_name, sub_value in value.items():
                    flat_metrics[f"{name}_{sub_name}"] = sub_value
            else:
                flat_metrics[name] = value
        
        if flat_metrics:
            axes[1, 0].bar(flat_metrics.keys(), flat_metrics.values(), color='gold', alpha=0.7)
            axes[1, 0].set_title('Evaluation Metrics')
            axes[1, 0].set_ylabel('Score')
            axes[1, 0].tick_params(axis='x', rotation=45)
            axes[1, 0].grid(True, alpha=0.3)
    
    # 4. Sample predictions vs targets
    if len(metrics.predictions) > 0:
        sample_size = min(5, len(metrics.predictions))
        sample_preds = metrics.predictions[:sample_size]
        sample_targets = metrics.targets[:sample_size]
        
        y_pos = np.arange(sample_size)
        axes[1, 1].barh(y_pos - 0.2, [len(p.split()) for p in sample_preds], 
                       height=0.4, label='Predictions', color='lightcoral', alpha=0.7)
        axes[1, 1].barh(y_pos + 0.2, [len(t.split()) for t in sample_targets], 
                       height=0.4, label='Targets', color='lightgreen', alpha=0.7)
        axes[1, 1].set_title('Sample Response Lengths')
        axes[1, 1].set_xlabel('Number of Words')
        axes[1, 1].set_yticks(y_pos)
        axes[1, 1].set_yticklabels([f'Sample {i+1}' for i in range(sample_size)])
        axes[1, 1].legend()
        axes[1, 1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(save_dir, 'evaluation_plots.png'), dpi=300, bbox_inches='tight')
    plt.close()

def create_evaluation_report(metrics: EvaluationMetrics, samples: List[Dict[str, str]], 
                           config: Dict[str, Any], save_path: str = "evaluation_report.md"):
    """Create a comprehensive evaluation report."""
    
    calculated_metrics = metrics.calculate_all_metrics()
    
    report = f"""# CareConnect v5.0 - Model Evaluation Report

Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary

- **Total Samples Evaluated**: {len(metrics.predictions)}
- **Evaluation Configuration**: {json.dumps(config, indent=2)}

## Metrics

"""
    
    # Add metrics
    for metric_name, metric_value in calculated_metrics.items():
        if isinstance(metric_value, dict):
            report += f"### {metric_name.title()}\n"
            for sub_name, sub_value in metric_value.items():
                report += f"- **{sub_name}**: {sub_value:.4f}\n"
        else:
            report += f"- **{metric_name.title()}**: {metric_value:.4f}\n"
    
    report += "\n## Sample Predictions\n\n"
    
    # Add sample predictions
    for i, (pred, target) in enumerate(zip(metrics.predictions[:10], metrics.targets[:10])):
        report += f"### Sample {i+1}\n"
        report += f"**Input**: (Context provided)\n"
        report += f"**Target**: {target}\n"
        report += f"**Prediction**: {pred}\n"
        report += f"**Loss**: {metrics.losses[i] if i < len(metrics.losses) else 'N/A'}\n\n"
    
    report += "## Generated Samples\n\n"
    
    # Add generated samples
    for sample in samples:
        report += f"### {sample['prompt']}\n"
        report += f"**Response**: {sample['response']}\n\n"
    
    # Save report
    with open(save_path, 'w') as f:
        f.write(report)

# =============================================================================
# Data Loading
# =============================================================================

def load_test_data(data_path: str = "data/test_data.json") -> List[Dict[str, str]]:
    """Load test data for evaluation."""
    if os.path.exists(data_path):
        with open(data_path, 'r') as f:
            return json.load(f)
    else:
        # Generate sample test data
        return generate_test_data()

def generate_test_data() -> List[Dict[str, str]]:
    """Generate sample test data."""
    test_data = [
        {
            "input": "I'm feeling anxious about my presentation tomorrow",
            "target": "It's completely normal to feel anxious before a presentation. Let's work through some strategies to help you feel more confident and prepared."
        },
        {
            "input": "How can I improve my time management?",
            "target": "Time management is a skill that can be developed with practice. Let's explore some techniques that might work well for your specific situation."
        },
        {
            "input": "I'm struggling with my diet",
            "target": "Diet changes can be challenging, and it's important to be kind to yourself during this process. What specific aspects are you finding difficult?"
        },
        {
            "input": "I want to start meditating",
            "target": "Meditation is a wonderful practice for mental well-being. Let's start with some simple techniques that you can easily incorporate into your daily routine."
        },
        {
            "input": "I'm having conflicts with my roommate",
            "target": "Roommate conflicts can be stressful. Let's discuss the specific issues and explore some communication strategies that might help resolve the situation."
        }
    ]
    
    # Expand with more variations
    expanded_data = []
    for item in test_data:
        expanded_data.append(item)
        expanded_data.append({
            "input": f"User: {item['input']}",
            "target": f"Assistant: {item['target']}"
        })
    
    return expanded_data

# =============================================================================
# Main Evaluation Function
# =============================================================================

def main():
    """Main evaluation execution."""
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/evaluation.log'),
            logging.StreamHandler()
        ]
    )
    
    # Load configuration
    config = load_evaluation_config()
    logging.info(f"Evaluation configuration: {config}")
    
    # Create model
    model_config = ModelConfig()
    model = CareConnectModel(model_config)
    logging.info(f"Model loaded on device: {model.device}")
    
    # Load test data
    test_data = load_test_data()
    logging.info(f"Loaded {len(test_data)} test samples")
    
    # Create evaluation directory
    eval_dir = "evaluation_results"
    os.makedirs(eval_dir, exist_ok=True)
    
    # Evaluate model
    start_time = time.time()
    metrics = evaluate_model(model, test_data, config)
    evaluation_time = time.time() - start_time
    
    # Calculate metrics
    calculated_metrics = metrics.calculate_all_metrics()
    
    # Generate sample responses
    samples = []
    if config.get('generate_samples', True):
        samples = generate_sample_responses(model, config)
    
    # Save results
    metrics.save_results(os.path.join(eval_dir, 'evaluation_results.json'))
    
    # Save samples
    if samples:
        with open(os.path.join(eval_dir, 'generated_samples.json'), 'w') as f:
            json.dump(samples, f, indent=2)
    
    # Create visualizations
    plot_evaluation_results(metrics, eval_dir)
    
    # Create report
    create_evaluation_report(metrics, samples, config, 
                           os.path.join(eval_dir, 'evaluation_report.md'))
    
    # Print summary
    print("\n" + "="*50)
    print("EVALUATION SUMMARY")
    print("="*50)
    print(f"Evaluation time: {evaluation_time:.2f} seconds")
    print(f"Samples evaluated: {len(metrics.predictions)}")
    print(f"Perplexity: {calculated_metrics.get('perplexity', 'N/A'):.4f}")
    print(f"Accuracy: {calculated_metrics.get('accuracy', 'N/A'):.4f}")
    print(f"BLEU Score: {calculated_metrics.get('bleu', 'N/A'):.4f}")
    
    if 'rouge' in calculated_metrics:
        rouge_scores = calculated_metrics['rouge']
        print(f"ROUGE-1: {rouge_scores.get('rouge1', 'N/A'):.4f}")
        print(f"ROUGE-2: {rouge_scores.get('rouge2', 'N/A'):.4f}")
        print(f"ROUGE-L: {rouge_scores.get('rougeL', 'N/A'):.4f}")
    
    print(f"Semantic Similarity: {calculated_metrics.get('semantic_similarity', 'N/A'):.4f}")
    print(f"Results saved to: {eval_dir}")
    print("="*50)

if __name__ == "__main__":
    main()
