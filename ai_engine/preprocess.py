"""
CareConnect v5.0 - The Steward AI Engine
Data preprocessing script for the CareConnect model
"""

import json
import os
import logging
import re
import string
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import argparse
from pathlib import Path
import numpy as np
from collections import Counter
import unicodedata

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Data preprocessing utilities for CareConnect AI"""
    
    def __init__(self, config_path: str = "config/preprocess_config.json"):
        self.config_path = config_path
        self.config = self.load_config()
        
        # Text cleaning patterns
        self.url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.phone_pattern = re.compile(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b')
        
        logger.info("DataPreprocessor initialized")
    
    def load_config(self) -> Dict:
        """Load preprocessing configuration"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
            else:
                config = self.get_default_config()
                self.save_config(config)
            
            return config
            
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return self.get_default_config()
    
    def get_default_config(self) -> Dict:
        """Get default preprocessing configuration"""
        return {
            "max_sequence_length": 512,
            "min_sequence_length": 10,
            "vocab_size": 50000,
            "min_word_frequency": 2,
            "remove_urls": True,
            "remove_emails": True,
            "remove_phones": True,
            "normalize_unicode": True,
            "remove_punctuation": False,
            "lowercase": True,
            "remove_stopwords": False,
            "lemmatize": False,
            "special_tokens": {
                "pad": "<PAD>",
                "unk": "<UNK>",
                "bos": "<BOS>",
                "eos": "<EOS>",
                "sep": "<SEP>"
            }
        }
    
    def save_config(self, config: Dict):
        """Save configuration to file"""
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving config: {e}")
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text or not isinstance(text, str):
            return ""
        
        # Normalize unicode
        if self.config["normalize_unicode"]:
            text = unicodedata.normalize('NFKC', text)
        
        # Remove URLs
        if self.config["remove_urls"]:
            text = self.url_pattern.sub(' [URL] ', text)
        
        # Remove emails
        if self.config["remove_emails"]:
            text = self.email_pattern.sub(' [EMAIL] ', text)
        
        # Remove phone numbers
        if self.config["remove_phones"]:
            text = self.phone_pattern.sub(' [PHONE] ', text)
        
        # Convert to lowercase
        if self.config["lowercase"]:
            text = text.lower()
        
        # Remove punctuation (optional)
        if self.config["remove_punctuation"]:
            text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Clean whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize_text(self, text: str) -> List[str]:
        """Tokenize text into words"""
        # Simple word tokenization
        tokens = text.split()
        
        # Remove stopwords if configured
        if self.config["remove_stopwords"]:
            stopwords = self.get_stopwords()
            tokens = [token for token in tokens if token not in stopwords]
        
        return tokens
    
    def get_stopwords(self) -> set:
        """Get common stopwords"""
        return {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'i', 'you', 'me', 'my', 'your', 'yours',
            'we', 'us', 'our', 'ours', 'they', 'them', 'their', 'theirs'
        }
    
    def build_vocabulary(self, texts: List[str]) -> Dict[str, int]:
        """Build vocabulary from texts"""
        logger.info("Building vocabulary...")
        
        # Collect all tokens
        all_tokens = []
        for text in texts:
            cleaned_text = self.clean_text(text)
            tokens = self.tokenize_text(cleaned_text)
            all_tokens.extend(tokens)
        
        # Count token frequencies
        token_counts = Counter(all_tokens)
        
        # Filter by minimum frequency
        min_freq = self.config["min_word_frequency"]
        filtered_tokens = {token: count for token, count in token_counts.items() 
                          if count >= min_freq}
        
        # Sort by frequency
        sorted_tokens = sorted(filtered_tokens.items(), key=lambda x: x[1], reverse=True)
        
        # Build vocabulary
        vocab = {}
        
        # Add special tokens
        for token_name, token_symbol in self.config["special_tokens"].items():
            vocab[token_symbol] = len(vocab)
        
        # Add most frequent tokens
        max_vocab_size = self.config["vocab_size"] - len(vocab)
        for token, count in sorted_tokens[:max_vocab_size]:
            vocab[token] = len(vocab)
        
        logger.info(f"Vocabulary built with {len(vocab)} tokens")
        return vocab
    
    def text_to_sequence(self, text: str, vocab: Dict[str, int]) -> List[int]:
        """Convert text to sequence of token IDs"""
        cleaned_text = self.clean_text(text)
        tokens = self.tokenize_text(cleaned_text)
        
        # Convert tokens to IDs
        sequence = []
        for token in tokens:
            if token in vocab:
                sequence.append(vocab[token])
            else:
                sequence.append(vocab[self.config["special_tokens"]["unk"]])
        
        return sequence
    
    def sequence_to_text(self, sequence: List[int], vocab: Dict[str, int]) -> str:
        """Convert sequence of token IDs back to text"""
        reverse_vocab = {v: k for k, v in vocab.items()}
        
        tokens = []
        for token_id in sequence:
            if token_id in reverse_vocab:
                token = reverse_vocab[token_id]
                if token not in self.config["special_tokens"].values():
                    tokens.append(token)
        
        return ' '.join(tokens)
    
    def pad_sequence(self, sequence: List[int], max_length: int) -> List[int]:
        """Pad sequence to max_length"""
        if len(sequence) > max_length:
            return sequence[:max_length]
        else:
            return sequence + [0] * (max_length - len(sequence))
    
    def create_training_pairs(self, conversations: List[Dict]) -> List[Dict]:
        """Create training pairs from conversations"""
        training_pairs = []
        
        for conversation in conversations:
            input_text = conversation.get("input", "")
            output_text = conversation.get("output", "")
            
            if input_text and output_text:
                # Clean texts
                cleaned_input = self.clean_text(input_text)
                cleaned_output = self.clean_text(output_text)
                
                # Check length constraints
                if (len(cleaned_input.split()) >= self.config["min_sequence_length"] and
                    len(cleaned_output.split()) >= self.config["min_sequence_length"]):
                    
                    training_pairs.append({
                        "input": cleaned_input,
                        "output": cleaned_output,
                        "original_input": input_text,
                        "original_output": output_text
                    })
        
        logger.info(f"Created {len(training_pairs)} training pairs")
        return training_pairs
    
    def preprocess_dataset(self, input_path: str, output_path: str) -> Dict:
        """Preprocess entire dataset"""
        logger.info(f"Preprocessing dataset from {input_path}")
        
        try:
            # Load data
            with open(input_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract conversations
            conversations = []
            if isinstance(data, list):
                conversations = data
            elif isinstance(data, dict) and "conversations" in data:
                conversations = data["conversations"]
            
            # Create training pairs
            training_pairs = self.create_training_pairs(conversations)
            
            # Extract all texts for vocabulary building
            all_texts = []
            for pair in training_pairs:
                all_texts.append(pair["input"])
                all_texts.append(pair["output"])
            
            # Build vocabulary
            vocab = self.build_vocabulary(all_texts)
            
            # Convert to sequences
            processed_data = []
            for pair in training_pairs:
                input_seq = self.text_to_sequence(pair["input"], vocab)
                output_seq = self.text_to_sequence(pair["output"], vocab)
                
                # Pad sequences
                input_seq = self.pad_sequence(input_seq, self.config["max_sequence_length"])
                output_seq = self.pad_sequence(output_seq, self.config["max_sequence_length"])
                
                processed_data.append({
                    "input_ids": input_seq,
                    "output_ids": output_seq,
                    "input_text": pair["input"],
                    "output_text": pair["output"]
                })
            
            # Save processed data
            output_data = {
                "config": self.config,
                "vocabulary": vocab,
                "vocabulary_size": len(vocab),
                "training_pairs": len(processed_data),
                "data": processed_data,
                "preprocessing_timestamp": datetime.now().isoformat()
            }
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            
            # Save vocabulary separately
            vocab_path = output_path.replace('.json', '_vocab.json')
            with open(vocab_path, 'w', encoding='utf-8') as f:
                json.dump(vocab, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Preprocessing completed. Saved to {output_path}")
            
            return {
                "vocabulary_size": len(vocab),
                "training_pairs": len(processed_data),
                "output_path": output_path,
                "vocab_path": vocab_path
            }
            
        except Exception as e:
            logger.error(f"Error preprocessing dataset: {e}")
            raise
    
    def analyze_dataset(self, data_path: str) -> Dict:
        """Analyze dataset statistics"""
        logger.info(f"Analyzing dataset: {data_path}")
        
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            conversations = []
            if isinstance(data, list):
                conversations = data
            elif isinstance(data, dict) and "conversations" in data:
                conversations = data["conversations"]
            
            # Calculate statistics
            total_conversations = len(conversations)
            input_lengths = []
            output_lengths = []
            all_words = set()
            
            for conv in conversations:
                input_text = conv.get("input", "")
                output_text = conv.get("output", "")
                
                input_lengths.append(len(input_text.split()))
                output_lengths.append(len(output_text.split()))
                
                all_words.update(input_text.lower().split())
                all_words.update(output_text.lower().split())
            
            stats = {
                "total_conversations": total_conversations,
                "unique_words": len(all_words),
                "input_length_stats": {
                    "mean": np.mean(input_lengths),
                    "median": np.median(input_lengths),
                    "min": np.min(input_lengths),
                    "max": np.max(input_lengths),
                    "std": np.std(input_lengths)
                },
                "output_length_stats": {
                    "mean": np.mean(output_lengths),
                    "median": np.median(output_lengths),
                    "min": np.min(output_lengths),
                    "max": np.max(output_lengths),
                    "std": np.std(output_lengths)
                }
            }
            
            logger.info(f"Dataset analysis completed: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error analyzing dataset: {e}")
            raise

def main():
    """Main preprocessing function"""
    parser = argparse.ArgumentParser(description="Preprocess CareConnect AI training data")
    parser.add_argument("--input", type=str, required=True, help="Input data path")
    parser.add_argument("--output", type=str, required=True, help="Output data path")
    parser.add_argument("--config", type=str, default="config/preprocess_config.json", help="Config path")
    parser.add_argument("--analyze", action="store_true", help="Analyze dataset only")
    
    args = parser.parse_args()
    
    # Initialize preprocessor
    preprocessor = DataPreprocessor(args.config)
    
    if args.analyze:
        # Analyze dataset
        stats = preprocessor.analyze_dataset(args.input)
        print(f"Dataset Statistics: {json.dumps(stats, indent=2)}")
    else:
        # Preprocess dataset
        result = preprocessor.preprocess_dataset(args.input, args.output)
        print(f"Preprocessing Result: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    main()
