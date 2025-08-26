# =============================================================================
# CareConnect v5.0 - AI Training Script
# =============================================================================

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import json
import os
import time
import logging
from typing import List, Tuple, Dict, Any, Optional
from tqdm import tqdm
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
import yaml

from model import CareConnectModel, ModelConfig, SimpleTokenizer

# =============================================================================
# Configuration
# =============================================================================

def load_training_config(config_path: str = "config.yaml") -> Dict[str, Any]:
    """Load training configuration from file."""
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        return config.get('ai_engine', {}).get('training', {})
    else:
        return {
            'epochs': 10,
            'batch_size': 4,
            'learning_rate': 1e-4,
            'max_length': 2048,
            'validation_split': 0.2,
            'save_interval': 5,
            'early_stopping_patience': 3,
            'gradient_clip': 1.0,
            'warmup_steps': 1000,
            'weight_decay': 0.01
        }

# =============================================================================
# Dataset Classes
# =============================================================================

class CareConnectDataset(Dataset):
    """Dataset for CareConnect training data."""
    
    def __init__(self, data: List[Dict[str, str]], tokenizer: SimpleTokenizer, max_length: int = 2048):
        self.data = data
        self.tokenizer = tokenizer
        self.max_length = max_length
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data[idx]
        
        # Combine input and target for language modeling
        input_text = item.get('input', '')
        target_text = item.get('target', '')
        
        # Create full sequence
        full_text = f"{input_text} {target_text}"
        
        # Tokenize
        input_ids = self.tokenizer.encode(full_text, return_tensors='pt').squeeze(0)
        
        # Truncate if too long
        if len(input_ids) > self.max_length:
            input_ids = input_ids[:self.max_length]
        
        # Create labels (shifted by 1 for next token prediction)
        labels = input_ids.clone()
        labels[:-1] = input_ids[1:]
        labels[-1] = -100  # Ignore last token in loss calculation
        
        # Create attention mask
        attention_mask = torch.ones_like(input_ids)
        
        return {
            'input_ids': input_ids,
            'attention_mask': attention_mask,
            'labels': labels
        }

def collate_fn(batch):
    """Collate function for DataLoader."""
    input_ids = [item['input_ids'] for item in batch]
    attention_masks = [item['attention_mask'] for item in batch]
    labels = [item['labels'] for item in batch]
    
    # Pad sequences
    max_length = max(len(ids) for ids in input_ids)
    
    padded_input_ids = []
    padded_attention_masks = []
    padded_labels = []
    
    for ids, mask, label in zip(input_ids, attention_masks, labels):
        padding_length = max_length - len(ids)
        
        padded_input_ids.append(torch.cat([ids, torch.zeros(padding_length, dtype=torch.long)]))
        padded_attention_masks.append(torch.cat([mask, torch.zeros(padding_length, dtype=torch.long)]))
        padded_labels.append(torch.cat([label, torch.full((padding_length,), -100, dtype=torch.long)]))
    
    return {
        'input_ids': torch.stack(padded_input_ids),
        'attention_mask': torch.stack(padded_attention_masks),
        'labels': torch.stack(padded_labels)
    }

# =============================================================================
# Training Utilities
# =============================================================================

class TrainingMetrics:
    """Track training metrics."""
    
    def __init__(self):
        self.train_losses = []
        self.val_losses = []
        self.learning_rates = []
        self.epochs = []
        
    def update(self, epoch: int, train_loss: float, val_loss: float, lr: float):
        """Update metrics."""
        self.epochs.append(epoch)
        self.train_losses.append(train_loss)
        self.val_losses.append(val_loss)
        self.learning_rates.append(lr)
    
    def plot_metrics(self, save_path: str = "training_metrics.png"):
        """Plot training metrics."""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Loss plot
        ax1.plot(self.epochs, self.train_losses, label='Training Loss', color='blue')
        ax1.plot(self.epochs, self.val_losses, label='Validation Loss', color='red')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss')
        ax1.set_title('Training and Validation Loss')
        ax1.legend()
        ax1.grid(True)
        
        # Learning rate plot
        ax2.plot(self.epochs, self.learning_rates, label='Learning Rate', color='green')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Learning Rate')
        ax2.set_title('Learning Rate Schedule')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig(save_path)
        plt.close()
    
    def save_metrics(self, save_path: str = "training_metrics.json"):
        """Save metrics to file."""
        metrics = {
            'epochs': self.epochs,
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'learning_rates': self.learning_rates
        }
        
        with open(save_path, 'w') as f:
            json.dump(metrics, f, indent=2)

class EarlyStopping:
    """Early stopping mechanism."""
    
    def __init__(self, patience: int = 3, min_delta: float = 0.001):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = float('inf')
        
    def __call__(self, val_loss: float) -> bool:
        """Check if training should stop."""
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
        else:
            self.counter += 1
            
        return self.counter >= self.patience

# =============================================================================
# Training Functions
# =============================================================================

def create_optimizer(model: nn.Module, config: Dict[str, Any]) -> optim.Optimizer:
    """Create optimizer with weight decay."""
    no_decay = ['bias', 'LayerNorm.weight']
    optimizer_grouped_parameters = [
        {
            'params': [p for n, p in model.named_parameters() if not any(nd in n for nd in no_decay)],
            'weight_decay': config.get('weight_decay', 0.01)
        },
        {
            'params': [p for n, p in model.named_parameters() if any(nd in n for nd in no_decay)],
            'weight_decay': 0.0
        }
    ]
    
    return optim.AdamW(
        optimizer_grouped_parameters,
        lr=config.get('learning_rate', 1e-4),
        betas=(0.9, 0.999),
        eps=1e-8
    )

def create_scheduler(optimizer: optim.Optimizer, config: Dict[str, Any], total_steps: int):
    """Create learning rate scheduler."""
    from torch.optim.lr_scheduler import CosineAnnealingLR, OneCycleLR
    
    scheduler_type = config.get('scheduler', 'cosine')
    
    if scheduler_type == 'cosine':
        return CosineAnnealingLR(optimizer, T_max=total_steps)
    elif scheduler_type == 'onecycle':
        return OneCycleLR(
            optimizer,
            max_lr=config.get('learning_rate', 1e-4),
            total_steps=total_steps,
            pct_start=0.1
        )
    else:
        return None

def train_epoch(model: nn.Module, dataloader: DataLoader, optimizer: optim.Optimizer, 
                scheduler, device: torch.device, config: Dict[str, Any]) -> float:
    """Train for one epoch."""
    model.train()
    total_loss = 0
    num_batches = len(dataloader)
    
    progress_bar = tqdm(dataloader, desc="Training")
    
    for batch_idx, batch in enumerate(progress_bar):
        # Move batch to device
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        # Forward pass
        optimizer.zero_grad()
        outputs = model.transformer(input_ids, attention_mask=attention_mask)
        
        # Calculate loss
        loss_fct = nn.CrossEntropyLoss(ignore_index=-100)
        loss = loss_fct(outputs.view(-1, outputs.size(-1)), labels.view(-1))
        
        # Backward pass
        loss.backward()
        
        # Gradient clipping
        if config.get('gradient_clip', 1.0) > 0:
            torch.nn.utils.clip_grad_norm_(model.parameters(), config['gradient_clip'])
        
        optimizer.step()
        
        if scheduler:
            scheduler.step()
        
        total_loss += loss.item()
        
        # Update progress bar
        progress_bar.set_postfix({
            'loss': f"{loss.item():.4f}",
            'avg_loss': f"{total_loss / (batch_idx + 1):.4f}"
        })
    
    return total_loss / num_batches

def validate_epoch(model: nn.Module, dataloader: DataLoader, device: torch.device) -> float:
    """Validate for one epoch."""
    model.eval()
    total_loss = 0
    num_batches = len(dataloader)
    
    with torch.no_grad():
        for batch in tqdm(dataloader, desc="Validation"):
            # Move batch to device
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            # Forward pass
            outputs = model.transformer(input_ids, attention_mask=attention_mask)
            
            # Calculate loss
            loss_fct = nn.CrossEntropyLoss(ignore_index=-100)
            loss = loss_fct(outputs.view(-1, outputs.size(-1)), labels.view(-1))
            
            total_loss += loss.item()
    
    return total_loss / num_batches

# =============================================================================
# Data Loading
# =============================================================================

def load_training_data(data_path: str = "data/training_data.json") -> List[Dict[str, str]]:
    """Load training data from file."""
    if os.path.exists(data_path):
        with open(data_path, 'r') as f:
            return json.load(f)
    else:
        # Generate sample data if file doesn't exist
        return generate_sample_data()

def generate_sample_data() -> List[Dict[str, str]]:
    """Generate sample training data."""
    sample_data = [
        {
            "input": "How are you feeling today?",
            "target": "I'm feeling quite good today, thank you for asking. How about you?"
        },
        {
            "input": "I'm feeling stressed about work",
            "target": "I understand that work stress can be overwhelming. Let's talk about what's causing this stress and find some ways to manage it."
        },
        {
            "input": "Can you help me with my goals?",
            "target": "Of course! I'd be happy to help you with your goals. What specific goals would you like to work on?"
        },
        {
            "input": "I need motivation to exercise",
            "target": "Exercise can be challenging to start, but it's so beneficial for your health and mood. What type of exercise interests you?"
        },
        {
            "input": "I'm having trouble sleeping",
            "target": "Sleep issues can really affect your daily life. Let's explore some strategies that might help improve your sleep quality."
        }
    ]
    
    # Create more variations
    expanded_data = []
    for item in sample_data:
        expanded_data.append(item)
        # Add variations
        expanded_data.append({
            "input": f"User: {item['input']}",
            "target": f"Assistant: {item['target']}"
        })
    
    return expanded_data

# =============================================================================
# Main Training Function
# =============================================================================

def train_model(model: CareConnectModel, config: Dict[str, Any], 
                train_dataloader: DataLoader, val_dataloader: DataLoader,
                save_dir: str = "checkpoints") -> Dict[str, Any]:
    """Main training function."""
    
    # Create save directory
    os.makedirs(save_dir, exist_ok=True)
    
    # Setup device
    device = model.device
    
    # Setup optimizer and scheduler
    optimizer = create_optimizer(model.transformer, config)
    total_steps = len(train_dataloader) * config.get('epochs', 10)
    scheduler = create_scheduler(optimizer, config, total_steps)
    
    # Setup metrics and early stopping
    metrics = TrainingMetrics()
    early_stopping = EarlyStopping(
        patience=config.get('early_stopping_patience', 3)
    )
    
    # Training loop
    best_val_loss = float('inf')
    
    for epoch in range(config.get('epochs', 10)):
        print(f"\nEpoch {epoch + 1}/{config.get('epochs', 10)}")
        print("=" * 50)
        
        # Train
        train_loss = train_epoch(model, train_dataloader, optimizer, scheduler, device, config)
        
        # Validate
        val_loss = validate_epoch(model, val_dataloader, device)
        
        # Update metrics
        current_lr = optimizer.param_groups[0]['lr']
        metrics.update(epoch + 1, train_loss, val_loss, current_lr)
        
        print(f"Training Loss: {train_loss:.4f}")
        print(f"Validation Loss: {val_loss:.4f}")
        print(f"Learning Rate: {current_lr:.6f}")
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            model.save_model(os.path.join(save_dir, "best_model.pt"))
            print("New best model saved!")
        
        # Save checkpoint
        if (epoch + 1) % config.get('save_interval', 5) == 0:
            checkpoint_path = os.path.join(save_dir, f"checkpoint_epoch_{epoch + 1}.pt")
            model.save_model(checkpoint_path)
            print(f"Checkpoint saved: {checkpoint_path}")
        
        # Early stopping
        if early_stopping(val_loss):
            print("Early stopping triggered!")
            break
    
    # Save final model
    model.save_model(os.path.join(save_dir, "final_model.pt"))
    
    # Save metrics
    metrics.save_metrics(os.path.join(save_dir, "training_metrics.json"))
    metrics.plot_metrics(os.path.join(save_dir, "training_metrics.png"))
    
    return {
        'best_val_loss': best_val_loss,
        'final_train_loss': train_loss,
        'final_val_loss': val_loss,
        'epochs_completed': epoch + 1
    }

# =============================================================================
# Main Execution
# =============================================================================

def main():
    """Main training execution."""
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/training.log'),
            logging.StreamHandler()
        ]
    )
    
    # Load configuration
    config = load_training_config()
    logging.info(f"Training configuration: {config}")
    
    # Create model
    model_config = ModelConfig()
    model = CareConnectModel(model_config)
    logging.info(f"Model created on device: {model.device}")
    
    # Load training data
    training_data = load_training_data()
    logging.info(f"Loaded {len(training_data)} training samples")
    
    # Create tokenizer
    tokenizer = SimpleTokenizer()
    
    # Split data
    train_data, val_data = train_test_split(
        training_data, 
        test_size=config.get('validation_split', 0.2),
        random_state=42
    )
    
    # Create datasets
    train_dataset = CareConnectDataset(
        train_data, 
        tokenizer, 
        config.get('max_length', 2048)
    )
    val_dataset = CareConnectDataset(
        val_data, 
        tokenizer, 
        config.get('max_length', 2048)
    )
    
    # Create dataloaders
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=config.get('batch_size', 4),
        shuffle=True,
        collate_fn=collate_fn,
        num_workers=0
    )
    val_dataloader = DataLoader(
        val_dataset,
        batch_size=config.get('batch_size', 4),
        shuffle=False,
        collate_fn=collate_fn,
        num_workers=0
    )
    
    logging.info(f"Training batches: {len(train_dataloader)}")
    logging.info(f"Validation batches: {len(val_dataloader)}")
    
    # Train model
    start_time = time.time()
    results = train_model(model, config, train_dataloader, val_dataloader)
    end_time = time.time()
    
    # Log results
    logging.info(f"Training completed in {end_time - start_time:.2f} seconds")
    logging.info(f"Training results: {results}")
    
    print("\nTraining completed successfully!")
    print(f"Best validation loss: {results['best_val_loss']:.4f}")
    print(f"Training time: {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    main()
