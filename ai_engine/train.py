"""
CareConnect v5.0 - The Steward AI Engine
Training script for the CareConnect model
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import json
import os
import logging
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import numpy as np
from pathlib import Path
import argparse
from tqdm import tqdm

from model import CareConnectModel, CareConnectConfig, CareConnectAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CareConnectDataset(Dataset):
    """Dataset for CareConnect training data"""
    
    def __init__(self, data_path: str, max_length: int = 512, tokenizer=None):
        self.data_path = data_path
        self.max_length = max_length
        self.tokenizer = tokenizer
        self.data = self.load_data()
    
    def load_data(self) -> List[Dict]:
        """Load training data from file"""
        try:
            if os.path.exists(self.data_path):
                with open(self.data_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                # Create sample training data
                data = self.create_sample_data()
                self.save_data(data)
            
            logger.info(f"Loaded {len(data)} training examples")
            return data
            
        except Exception as e:
            logger.error(f"Error loading training data: {e}")
            return []
    
    def create_sample_data(self) -> List[Dict]:
        """Create sample training data for CareConnect"""
        sample_data = [
            {
                "input": "Hello, how can you help me today?",
                "output": "Hello! I'm CareConnect, your AI assistant. I can help you with health, creativity, finance, and community topics. What would you like to discuss?"
            },
            {
                "input": "I'm feeling stressed about my finances",
                "output": "I understand that financial stress can be overwhelming. Let's work together to create a plan. Would you like to discuss budgeting, saving strategies, or debt management?"
            },
            {
                "input": "How can I improve my health?",
                "output": "Great question! Health improvement involves several areas: nutrition, exercise, sleep, and mental wellness. What specific aspect would you like to focus on first?"
            },
            {
                "input": "I need creative inspiration for a project",
                "output": "Creativity can be sparked in many ways! Let's explore some techniques: brainstorming, mind mapping, or looking at different perspectives. What type of project are you working on?"
            },
            {
                "input": "How do I build better community connections?",
                "output": "Building community connections starts with genuine engagement. Consider joining local groups, volunteering, or reaching out to neighbors. What interests you most?"
            },
            {
                "input": "What are some good habits for daily wellness?",
                "output": "Excellent daily wellness habits include: regular exercise, balanced nutrition, adequate sleep, stress management, and social connection. Which area would you like to improve?"
            },
            {
                "input": "I want to learn about investing",
                "output": "Investing is a great way to build wealth over time. Let's start with the basics: understanding risk tolerance, diversification, and different investment types. What's your experience level?"
            },
            {
                "input": "How can I be more creative in my daily life?",
                "output": "Creativity can be cultivated daily! Try new experiences, practice mindfulness, keep a journal, or explore different art forms. What creative activities interest you?"
            },
            {
                "input": "I'm looking for ways to give back to my community",
                "output": "That's wonderful! Community service can take many forms: volunteering, mentoring, supporting local businesses, or organizing events. What causes are important to you?"
            },
            {
                "input": "What should I consider when setting health goals?",
                "output": "When setting health goals, consider: specificity, measurability, achievability, relevance, and time-bound targets. What health goals are you thinking about?"
            }
        ]
        
        return sample_data
    
    def save_data(self, data: List[Dict]):
        """Save training data to file"""
        try:
            os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
            with open(self.data_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved {len(data)} training examples to {self.data_path}")
        except Exception as e:
            logger.error(f"Error saving training data: {e}")
    
    def __len__(self) -> int:
        return len(self.data)
    
    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        item = self.data[idx]
        
        # Tokenize input and output
        input_ids = self.tokenizer.encode(item["input"])
        output_ids = self.tokenizer.encode(item["output"])
        
        # Pad sequences
        input_ids = self.pad_sequence(input_ids, self.max_length)
        output_ids = self.pad_sequence(output_ids, self.max_length)
        
        return {
            "input_ids": torch.tensor(input_ids, dtype=torch.long),
            "output_ids": torch.tensor(output_ids, dtype=torch.long),
            "attention_mask": torch.tensor([1] * len(input_ids), dtype=torch.long)
        }
    
    def pad_sequence(self, sequence: List[int], max_length: int) -> List[int]:
        """Pad sequence to max_length"""
        if len(sequence) > max_length:
            return sequence[:max_length]
        else:
            return sequence + [0] * (max_length - len(sequence))

class CareConnectTrainer:
    """Trainer class for CareConnect AI model"""
    
    def __init__(self, config: CareConnectConfig, model_path: str = "checkpoints/steward-v5.pt"):
        self.config = config
        self.model_path = model_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Initialize model
        self.model = CareConnectModel(config).to(self.device)
        
        # Initialize optimizer and scheduler
        self.optimizer = optim.AdamW(
            self.model.parameters(),
            lr=config.learning_rate,
            weight_decay=0.01
        )
        
        self.scheduler = optim.lr_scheduler.CosineAnnealingLR(
            self.optimizer,
            T_max=1000,
            eta_min=1e-6
        )
        
        # Loss function
        self.criterion = nn.CrossEntropyLoss(ignore_index=0)  # Ignore padding token
        
        # Training history
        self.training_history = {
            "loss": [],
            "accuracy": [],
            "learning_rate": []
        }
        
        logger.info(f"Trainer initialized on device: {self.device}")
    
    def train_epoch(self, dataloader: DataLoader) -> Tuple[float, float]:
        """Train for one epoch"""
        self.model.train()
        total_loss = 0.0
        total_correct = 0
        total_tokens = 0
        
        progress_bar = tqdm(dataloader, desc="Training")
        
        for batch in progress_bar:
            input_ids = batch["input_ids"].to(self.device)
            output_ids = batch["output_ids"].to(self.device)
            attention_mask = batch["attention_mask"].to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            logits = self.model(input_ids, attention_mask)
            
            # Calculate loss
            loss = self.criterion(
                logits.view(-1, self.config.vocab_size),
                output_ids.view(-1)
            )
            
            # Backward pass
            loss.backward()
            
            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.config.max_grad_norm)
            
            # Update weights
            self.optimizer.step()
            
            # Calculate accuracy
            predictions = torch.argmax(logits, dim=-1)
            correct = (predictions == output_ids).sum().item()
            total_correct += correct
            total_tokens += output_ids.numel()
            
            total_loss += loss.item()
            
            # Update progress bar
            progress_bar.set_postfix({
                "loss": f"{loss.item():.4f}",
                "accuracy": f"{correct/output_ids.numel():.4f}"
            })
        
        avg_loss = total_loss / len(dataloader)
        avg_accuracy = total_correct / total_tokens
        
        return avg_loss, avg_accuracy
    
    def validate(self, dataloader: DataLoader) -> Tuple[float, float]:
        """Validate the model"""
        self.model.eval()
        total_loss = 0.0
        total_correct = 0
        total_tokens = 0
        
        with torch.no_grad():
            for batch in tqdm(dataloader, desc="Validation"):
                input_ids = batch["input_ids"].to(self.device)
                output_ids = batch["output_ids"].to(self.device)
                attention_mask = batch["attention_mask"].to(self.device)
                
                # Forward pass
                logits = self.model(input_ids, attention_mask)
                
                # Calculate loss
                loss = self.criterion(
                    logits.view(-1, self.config.vocab_size),
                    output_ids.view(-1)
                )
                
                # Calculate accuracy
                predictions = torch.argmax(logits, dim=-1)
                correct = (predictions == output_ids).sum().item()
                total_correct += correct
                total_tokens += output_ids.numel()
                
                total_loss += loss.item()
        
        avg_loss = total_loss / len(dataloader)
        avg_accuracy = total_correct / total_tokens
        
        return avg_loss, avg_accuracy
    
    def train(self, 
              train_dataloader: DataLoader, 
              val_dataloader: Optional[DataLoader] = None,
              epochs: int = 10,
              save_every: int = 5) -> Dict:
        """Train the model"""
        logger.info(f"Starting training for {epochs} epochs")
        
        best_val_loss = float('inf')
        
        for epoch in range(epochs):
            logger.info(f"Epoch {epoch + 1}/{epochs}")
            
            # Training
            train_loss, train_accuracy = self.train_epoch(train_dataloader)
            
            # Validation
            val_loss, val_accuracy = 0.0, 0.0
            if val_dataloader:
                val_loss, val_accuracy = self.validate(val_dataloader)
            
            # Update learning rate
            self.scheduler.step()
            current_lr = self.optimizer.param_groups[0]['lr']
            
            # Log metrics
            logger.info(f"Train Loss: {train_loss:.4f}, Train Accuracy: {train_accuracy:.4f}")
            if val_dataloader:
                logger.info(f"Val Loss: {val_loss:.4f}, Val Accuracy: {val_accuracy:.4f}")
            logger.info(f"Learning Rate: {current_lr:.6f}")
            
            # Save training history
            self.training_history["loss"].append(train_loss)
            self.training_history["accuracy"].append(train_accuracy)
            self.training_history["learning_rate"].append(current_lr)
            
            # Save best model
            if val_dataloader and val_loss < best_val_loss:
                best_val_loss = val_loss
                self.save_model("checkpoints/best_model.pt")
                logger.info("Saved best model")
            
            # Save checkpoint periodically
            if (epoch + 1) % save_every == 0:
                self.save_model(f"checkpoints/checkpoint_epoch_{epoch + 1}.pt")
        
        # Save final model
        self.save_model(self.model_path)
        logger.info("Training completed")
        
        return self.training_history
    
    def save_model(self, path: str):
        """Save model checkpoint"""
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            checkpoint = {
                'model_state_dict': self.model.state_dict(),
                'optimizer_state_dict': self.optimizer.state_dict(),
                'scheduler_state_dict': self.scheduler.state_dict(),
                'config': self.config.__dict__,
                'training_history': self.training_history,
                'timestamp': datetime.now().isoformat(),
                'version': self.config.version
            }
            
            torch.save(checkpoint, path)
            logger.info(f"Model saved to {path}")
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise
    
    def load_model(self, path: str):
        """Load model checkpoint"""
        try:
            checkpoint = torch.load(path, map_location=self.device)
            
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            self.scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
            
            if 'training_history' in checkpoint:
                self.training_history = checkpoint['training_history']
            
            logger.info(f"Model loaded from {path}")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise

def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description="Train CareConnect AI model")
    parser.add_argument("--config", type=str, default="config/model_config.json", help="Model config path")
    parser.add_argument("--data", type=str, default="data/training_data.json", help="Training data path")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--save_every", type=int, default=5, help="Save checkpoint every N epochs")
    parser.add_argument("--load_checkpoint", type=str, help="Load from checkpoint")
    
    args = parser.parse_args()
    
    # Load configuration
    config = CareConnectConfig(args.config)
    
    # Initialize AI system to get tokenizer
    ai = CareConnectAI()
    
    # Create datasets
    train_dataset = CareConnectDataset(args.data, config.max_seq_length, ai.tokenizer)
    
    # Split data for validation
    train_size = int(0.8 * len(train_dataset))
    val_size = len(train_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(train_dataset, [train_size, val_size])
    
    # Create dataloaders
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=config.batch_size,
        shuffle=True,
        num_workers=0
    )
    
    val_dataloader = DataLoader(
        val_dataset,
        batch_size=config.batch_size,
        shuffle=False,
        num_workers=0
    )
    
    # Initialize trainer
    trainer = CareConnectTrainer(config)
    
    # Load checkpoint if specified
    if args.load_checkpoint:
        trainer.load_model(args.load_checkpoint)
    
    # Train model
    history = trainer.train(
        train_dataloader,
        val_dataloader,
        epochs=args.epochs,
        save_every=args.save_every
    )
    
    # Save training history
    history_path = "logs/training_history.json"
    os.makedirs(os.path.dirname(history_path), exist_ok=True)
    with open(history_path, 'w') as f:
        json.dump(history, f, indent=2)
    
    logger.info("Training completed successfully")

if __name__ == "__main__":
    main()
