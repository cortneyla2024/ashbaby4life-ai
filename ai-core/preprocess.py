# =============================================================================
# CareConnect v5.0 - AI Data Preprocessing Script
# =============================================================================

import torch
import numpy as np
import json
import os
import re
import logging
from typing import List, Dict, Any, Tuple, Optional, Union
from collections import Counter, defaultdict
import pandas as pd
from datetime import datetime
import yaml
from tqdm import tqdm
import pickle
import hashlib

from model import SimpleTokenizer

# =============================================================================
# Configuration
# =============================================================================

def load_preprocessing_config(config_path: str = "config.yaml") -> Dict[str, Any]:
    """Load preprocessing configuration from file."""
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        return config.get('ai_engine', {}).get('preprocessing', {})
    else:
        return {
            'max_length': 2048,
            'min_length': 10,
            'vocab_size': 50257,
            'special_tokens': ['<pad>', '<bos>', '<eos>', '<unk>'],
            'text_cleaning': True,
            'lowercase': True,
            'remove_punctuation': False,
            'remove_numbers': False,
            'remove_stopwords': False,
            'lemmatization': False,
            'data_augmentation': True,
            'validation_split': 0.2,
            'test_split': 0.1,
            'random_seed': 42
        }

# =============================================================================
# Text Cleaning and Normalization
# =============================================================================

class TextCleaner:
    """Text cleaning and normalization utilities."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.stopwords = self._load_stopwords()
        
    def _load_stopwords(self) -> set:
        """Load stopwords list."""
        try:
            import nltk
            from nltk.corpus import stopwords
            nltk.download('stopwords', quiet=True)
            return set(stopwords.words('english'))
        except ImportError:
            logging.warning("NLTK not available, using basic stopwords")
            return {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text."""
        if not text or not isinstance(text, str):
            return ""
        
        # Basic cleaning
        text = text.strip()
        
        if self.config.get('lowercase', True):
            text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters if specified
        if self.config.get('remove_punctuation', False):
            text = re.sub(r'[^\w\s]', '', text)
        
        # Remove numbers if specified
        if self.config.get('remove_numbers', False):
            text = re.sub(r'\d+', '', text)
        
        # Remove stopwords if specified
        if self.config.get('remove_stopwords', False):
            words = text.split()
            words = [word for word in words if word.lower() not in self.stopwords]
            text = ' '.join(words)
        
        # Lemmatization if specified
        if self.config.get('lemmatization', False):
            text = self._lemmatize_text(text)
        
        return text.strip()
    
    def _lemmatize_text(self, text: str) -> str:
        """Apply lemmatization to text."""
        try:
            import nltk
            from nltk.stem import WordNetLemmatizer
            nltk.download('wordnet', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
            
            lemmatizer = WordNetLemmatizer()
            words = text.split()
            lemmatized_words = []
            
            for word in words:
                # Get POS tag for better lemmatization
                pos_tag = nltk.pos_tag([word])[0][1]
                if pos_tag.startswith('V'):
                    lemmatized_words.append(lemmatizer.lemmatize(word, pos='v'))
                elif pos_tag.startswith('J'):
                    lemmatized_words.append(lemmatizer.lemmatize(word, pos='a'))
                elif pos_tag.startswith('R'):
                    lemmatized_words.append(lemmatizer.lemmatize(word, pos='r'))
                else:
                    lemmatized_words.append(lemmatizer.lemmatize(word))
            
            return ' '.join(lemmatized_words)
        except ImportError:
            logging.warning("NLTK not available for lemmatization")
            return text

# =============================================================================
# Data Augmentation
# =============================================================================

class DataAugmenter:
    """Data augmentation utilities for text data."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.synonym_dict = self._load_synonyms()
    
    def _load_synonyms(self) -> Dict[str, List[str]]:
        """Load synonym dictionary."""
        # Simple synonym dictionary - in production, use WordNet or similar
        return {
            'good': ['great', 'excellent', 'wonderful', 'fantastic'],
            'bad': ['terrible', 'awful', 'horrible', 'dreadful'],
            'happy': ['joyful', 'cheerful', 'delighted', 'pleased'],
            'sad': ['unhappy', 'depressed', 'melancholy', 'gloomy'],
            'big': ['large', 'huge', 'enormous', 'massive'],
            'small': ['tiny', 'little', 'miniature', 'petite'],
            'fast': ['quick', 'rapid', 'swift', 'speedy'],
            'slow': ['sluggish', 'leisurely', 'gradual', 'unhurried']
        }
    
    def augment_text(self, text: str, augmentation_factor: int = 2) -> List[str]:
        """Generate augmented versions of text."""
        augmented_texts = [text]  # Keep original
        
        if not self.config.get('data_augmentation', True):
            return augmented_texts
        
        for _ in range(augmentation_factor - 1):
            augmented_text = self._apply_augmentation(text)
            if augmented_text and augmented_text != text:
                augmented_texts.append(augmented_text)
        
        return augmented_texts
    
    def _apply_augmentation(self, text: str) -> str:
        """Apply a single augmentation technique."""
        import random
        
        words = text.split()
        if len(words) < 3:
            return text
        
        # Random augmentation technique
        technique = random.choice(['synonym_replacement', 'word_swap', 'sentence_structure'])
        
        if technique == 'synonym_replacement':
            return self._synonym_replacement(words)
        elif technique == 'word_swap':
            return self._word_swap(words)
        elif technique == 'sentence_structure':
            return self._sentence_structure_change(words)
        
        return text
    
    def _synonym_replacement(self, words: List[str]) -> str:
        """Replace words with synonyms."""
        import random
        
        augmented_words = words.copy()
        num_replacements = max(1, len(words) // 10)  # Replace 10% of words
        
        for _ in range(num_replacements):
            word_idx = random.randint(0, len(augmented_words) - 1)
            word = augmented_words[word_idx].lower()
            
            if word in self.synonym_dict:
                synonym = random.choice(self.synonym_dict[word])
                augmented_words[word_idx] = synonym
        
        return ' '.join(augmented_words)
    
    def _word_swap(self, words: List[str]) -> str:
        """Swap adjacent words."""
        import random
        
        if len(words) < 2:
            return ' '.join(words)
        
        augmented_words = words.copy()
        swap_idx = random.randint(0, len(augmented_words) - 2)
        
        # Swap adjacent words
        augmented_words[swap_idx], augmented_words[swap_idx + 1] = \
            augmented_words[swap_idx + 1], augmented_words[swap_idx]
        
        return ' '.join(augmented_words)
    
    def _sentence_structure_change(self, words: List[str]) -> str:
        """Change sentence structure by moving phrases."""
        import random
        
        if len(words) < 5:
            return ' '.join(words)
        
        # Simple structure change: move a phrase to the end
        split_point = random.randint(2, len(words) - 2)
        first_part = words[:split_point]
        second_part = words[split_point:]
        
        # Move second part to the beginning
        return ' '.join(second_part + first_part)

# =============================================================================
# Tokenization and Vocabulary
# =============================================================================

class VocabularyBuilder:
    """Build and manage vocabulary for the model."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.special_tokens = config.get('special_tokens', ['<pad>', '<bos>', '<eos>', '<unk>'])
        self.vocab_size = config.get('vocab_size', 50257)
        self.word2idx = {}
        self.idx2word = {}
        self.word_counts = Counter()
        
    def build_vocabulary(self, texts: List[str]) -> Dict[str, int]:
        """Build vocabulary from text corpus."""
        logging.info("Building vocabulary...")
        
        # Count word frequencies
        for text in tqdm(texts, desc="Counting words"):
            words = text.split()
            self.word_counts.update(words)
        
        # Add special tokens
        for token in self.special_tokens:
            self.word2idx[token] = len(self.word2idx)
        
        # Add most frequent words
        most_common = self.word_counts.most_common(self.vocab_size - len(self.special_tokens))
        
        for word, count in most_common:
            if word not in self.word2idx:
                self.word2idx[word] = len(self.word2idx)
        
        # Create reverse mapping
        self.idx2word = {idx: word for word, idx in self.word2idx.items()}
        
        logging.info(f"Vocabulary built with {len(self.word2idx)} tokens")
        return self.word2idx
    
    def encode_text(self, text: str) -> List[int]:
        """Encode text to token IDs."""
        words = text.split()
        token_ids = []
        
        for word in words:
            if word in self.word2idx:
                token_ids.append(self.word2idx[word])
            else:
                token_ids.append(self.word2idx.get('<unk>', 0))
        
        return token_ids
    
    def decode_text(self, token_ids: List[int]) -> str:
        """Decode token IDs back to text."""
        words = []
        for token_id in token_ids:
            if token_id in self.idx2word:
                word = self.idx2word[token_id]
                if word not in self.special_tokens:
                    words.append(word)
        
        return ' '.join(words)
    
    def save_vocabulary(self, file_path: str):
        """Save vocabulary to file."""
        vocab_data = {
            'word2idx': self.word2idx,
            'idx2word': self.idx2word,
            'word_counts': dict(self.word_counts),
            'special_tokens': self.special_tokens,
            'vocab_size': self.vocab_size
        }
        
        with open(file_path, 'w') as f:
            json.dump(vocab_data, f, indent=2)
    
    def load_vocabulary(self, file_path: str):
        """Load vocabulary from file."""
        with open(file_path, 'r') as f:
            vocab_data = json.load(f)
        
        self.word2idx = vocab_data['word2idx']
        self.idx2word = vocab_data['idx2word']
        self.word_counts = Counter(vocab_data['word_counts'])
        self.special_tokens = vocab_data['special_tokens']
        self.vocab_size = vocab_data['vocab_size']

# =============================================================================
# Dataset Processing
# =============================================================================

class DatasetProcessor:
    """Process and prepare datasets for training."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.text_cleaner = TextCleaner(config)
        self.data_augmenter = DataAugmenter(config)
        self.vocab_builder = VocabularyBuilder(config)
        
    def process_conversation_data(self, data: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Process conversation-style data."""
        processed_data = []
        
        for item in tqdm(data, desc="Processing conversation data"):
            input_text = item.get('input', '')
            target_text = item.get('target', '')
            
            # Clean texts
            cleaned_input = self.text_cleaner.clean_text(input_text)
            cleaned_target = self.text_cleaner.clean_text(target_text)
            
            # Filter by length
            if self._is_valid_length(cleaned_input) and self._is_valid_length(cleaned_target):
                processed_item = {
                    'input': cleaned_input,
                    'target': cleaned_target,
                    'original_input': input_text,
                    'original_target': target_text
                }
                processed_data.append(processed_item)
        
        return processed_data
    
    def process_text_data(self, texts: List[str]) -> List[str]:
        """Process plain text data."""
        processed_texts = []
        
        for text in tqdm(texts, desc="Processing text data"):
            cleaned_text = self.text_cleaner.clean_text(text)
            
            if self._is_valid_length(cleaned_text):
                processed_texts.append(cleaned_text)
        
        return processed_texts
    
    def _is_valid_length(self, text: str) -> bool:
        """Check if text meets length requirements."""
        words = text.split()
        min_length = self.config.get('min_length', 10)
        max_length = self.config.get('max_length', 2048)
        
        return min_length <= len(words) <= max_length
    
    def create_training_pairs(self, processed_data: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Create training pairs from processed data."""
        training_pairs = []
        
        for item in processed_data:
            # Create base pair
            pair = {
                'input_ids': item['input'],
                'target_ids': item['target'],
                'input_length': len(item['input'].split()),
                'target_length': len(item['target'].split())
            }
            training_pairs.append(pair)
            
            # Add augmented versions
            if self.config.get('data_augmentation', True):
                augmented_inputs = self.data_augmenter.augment_text(item['input'])
                augmented_targets = self.data_augmenter.augment_text(item['target'])
                
                for aug_input, aug_target in zip(augmented_inputs[1:], augmented_targets[1:]):
                    if self._is_valid_length(aug_input) and self._is_valid_length(aug_target):
                        aug_pair = {
                            'input_ids': aug_input,
                            'target_ids': aug_target,
                            'input_length': len(aug_input.split()),
                            'target_length': len(aug_target.split())
                        }
                        training_pairs.append(aug_pair)
        
        return training_pairs
    
    def split_dataset(self, data: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Split dataset into train, validation, and test sets."""
        import random
        
        random.seed(self.config.get('random_seed', 42))
        random.shuffle(data)
        
        total_size = len(data)
        val_split = self.config.get('validation_split', 0.2)
        test_split = self.config.get('test_split', 0.1)
        
        val_size = int(total_size * val_split)
        test_size = int(total_size * test_split)
        train_size = total_size - val_size - test_size
        
        train_data = data[:train_size]
        val_data = data[train_size:train_size + val_size]
        test_data = data[train_size + val_size:]
        
        logging.info(f"Dataset split: Train={len(train_data)}, Val={len(val_data)}, Test={len(test_data)}")
        
        return train_data, val_data, test_data

# =============================================================================
# Data Loading and Saving
# =============================================================================

class DataManager:
    """Manage data loading, processing, and saving."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.processor = DatasetProcessor(config)
        
    def load_raw_data(self, file_path: str) -> List[Dict[str, str]]:
        """Load raw data from various formats."""
        if not os.path.exists(file_path):
            logging.warning(f"File {file_path} not found")
            return []
        
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.json':
            with open(file_path, 'r') as f:
                return json.load(f)
        elif file_ext == '.csv':
            df = pd.read_csv(file_path)
            return df.to_dict('records')
        elif file_ext == '.txt':
            with open(file_path, 'r') as f:
                lines = f.readlines()
                return [{'text': line.strip()} for line in lines if line.strip()]
        else:
            logging.error(f"Unsupported file format: {file_ext}")
            return []
    
    def save_processed_data(self, data: List[Dict[str, Any]], file_path: str):
        """Save processed data to file."""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        logging.info(f"Processed data saved to {file_path}")
    
    def create_data_manifest(self, data_files: List[str], output_dir: str):
        """Create a manifest of all processed data files."""
        manifest = {
            'created_at': datetime.now().isoformat(),
            'config': self.config,
            'files': []
        }
        
        for file_path in data_files:
            if os.path.exists(file_path):
                file_info = {
                    'path': file_path,
                    'size': os.path.getsize(file_path),
                    'modified': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
                }
                manifest['files'].append(file_info)
        
        manifest_path = os.path.join(output_dir, 'data_manifest.json')
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        logging.info(f"Data manifest saved to {manifest_path}")

# =============================================================================
# Main Preprocessing Pipeline
# =============================================================================

class PreprocessingPipeline:
    """Main preprocessing pipeline for CareConnect AI."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.data_manager = DataManager(config)
        self.processor = DatasetProcessor(config)
        
    def run_pipeline(self, input_file: str, output_dir: str) -> Dict[str, Any]:
        """Run the complete preprocessing pipeline."""
        
        logging.info("Starting preprocessing pipeline...")
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Load raw data
        raw_data = self.data_manager.load_raw_data(input_file)
        logging.info(f"Loaded {len(raw_data)} raw data samples")
        
        if not raw_data:
            logging.error("No data loaded, exiting pipeline")
            return {}
        
        # Process data
        processed_data = self.processor.process_conversation_data(raw_data)
        logging.info(f"Processed {len(processed_data)} data samples")
        
        # Create training pairs
        training_pairs = self.processor.create_training_pairs(processed_data)
        logging.info(f"Created {len(training_pairs)} training pairs")
        
        # Build vocabulary
        all_texts = [pair['input_ids'] + ' ' + pair['target_ids'] for pair in training_pairs]
        vocabulary = self.processor.vocab_builder.build_vocabulary(all_texts)
        
        # Save vocabulary
        vocab_path = os.path.join(output_dir, 'vocabulary.json')
        self.processor.vocab_builder.save_vocabulary(vocab_path)
        
        # Split dataset
        train_data, val_data, test_data = self.processor.split_dataset(training_pairs)
        
        # Save split datasets
        self.data_manager.save_processed_data(train_data, os.path.join(output_dir, 'train.json'))
        self.data_manager.save_processed_data(val_data, os.path.join(output_dir, 'val.json'))
        self.data_manager.save_processed_data(test_data, os.path.join(output_dir, 'test.json'))
        
        # Create manifest
        data_files = [
            os.path.join(output_dir, 'train.json'),
            os.path.join(output_dir, 'val.json'),
            os.path.join(output_dir, 'test.json'),
            vocab_path
        ]
        self.data_manager.create_data_manifest(data_files, output_dir)
        
        # Generate statistics
        stats = self._generate_statistics(train_data, val_data, test_data, vocabulary)
        
        # Save statistics
        stats_path = os.path.join(output_dir, 'preprocessing_stats.json')
        with open(stats_path, 'w') as f:
            json.dump(stats, f, indent=2)
        
        logging.info("Preprocessing pipeline completed successfully!")
        return stats
    
    def _generate_statistics(self, train_data: List[Dict], val_data: List[Dict], 
                           test_data: List[Dict], vocabulary: Dict[str, int]) -> Dict[str, Any]:
        """Generate preprocessing statistics."""
        
        # Calculate length statistics
        all_lengths = []
        for dataset in [train_data, val_data, test_data]:
            for item in dataset:
                all_lengths.extend([item['input_length'], item['target_length']])
        
        stats = {
            'dataset_sizes': {
                'train': len(train_data),
                'validation': len(val_data),
                'test': len(test_data),
                'total': len(train_data) + len(val_data) + len(test_data)
            },
            'vocabulary': {
                'size': len(vocabulary),
                'special_tokens': self.config.get('special_tokens', [])
            },
            'length_statistics': {
                'mean': np.mean(all_lengths),
                'std': np.std(all_lengths),
                'min': np.min(all_lengths),
                'max': np.max(all_lengths),
                'median': np.median(all_lengths)
            },
            'preprocessing_config': self.config,
            'timestamp': datetime.now().isoformat()
        }
        
        return stats

# =============================================================================
# Main Execution
# =============================================================================

def main():
    """Main preprocessing execution."""
    
    import argparse
    
    parser = argparse.ArgumentParser(description='CareConnect v5.0 Data Preprocessing')
    parser.add_argument('--input', type=str, required=True, help='Input data file path')
    parser.add_argument('--output', type=str, required=True, help='Output directory path')
    parser.add_argument('--config', type=str, default='config.yaml', help='Configuration file path')
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/preprocessing.log'),
            logging.StreamHandler()
        ]
    )
    
    # Load configuration
    config = load_preprocessing_config(args.config)
    logging.info(f"Preprocessing configuration: {config}")
    
    # Create and run pipeline
    pipeline = PreprocessingPipeline(config)
    stats = pipeline.run_pipeline(args.input, args.output)
    
    # Print summary
    if stats:
        print("\n" + "="*50)
        print("PREPROCESSING SUMMARY")
        print("="*50)
        print(f"Input file: {args.input}")
        print(f"Output directory: {args.output}")
        print(f"Total samples: {stats['dataset_sizes']['total']}")
        print(f"Train samples: {stats['dataset_sizes']['train']}")
        print(f"Validation samples: {stats['dataset_sizes']['validation']}")
        print(f"Test samples: {stats['dataset_sizes']['test']}")
        print(f"Vocabulary size: {stats['vocabulary']['size']}")
        print(f"Average length: {stats['length_statistics']['mean']:.1f} words")
        print("="*50)

if __name__ == "__main__":
    main()
