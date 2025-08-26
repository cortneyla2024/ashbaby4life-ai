#!/usr/bin/env python3
"""
CareConnect v5.0 - Local AI Inference Service
Handles local model loading and inference for privacy-first AI features
"""

import argparse
import json
import sys
import time
import traceback
from typing import Dict, Any, List, Optional
import logging
import os
import numpy as np
from pathlib import Path

# Try to import AI libraries
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    from sentence_transformers import SentenceTransformer
    import openai
except ImportError as e:
    print(f"Warning: Some AI libraries not available: {e}", file=sys.stderr)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LocalAIInference:
    def __init__(self, model_path: str, config: Dict[str, Any]):
        self.model_path = model_path
        self.config = config
        self.tokenizer = None
        self.model = None
        self.embedding_model = None
        self.text_generation_pipeline = None
        self.sentiment_pipeline = None
        self.is_ready = False
        
    def initialize(self):
        """Initialize the AI models"""
        try:
            logger.info(f"Loading model from {self.model_path}")
            
            # Load tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.float16,
                device_map="auto",
                trust_remote_code=True
            )
            
            # Load embedding model for search
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Create text generation pipeline
            self.text_generation_pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Create sentiment analysis pipeline
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=0 if torch.cuda.is_available() else -1
            )
            
            self.is_ready = True
            logger.info("AI models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise
    
    def generate_text(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.7) -> str:
        """Generate text using the local model"""
        try:
            if not self.is_ready:
                raise RuntimeError("Model not ready")
            
            # Generate text
            outputs = self.text_generation_pipeline(
                prompt,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            generated_text = outputs[0]['generated_text']
            # Remove the original prompt from the generated text
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):].strip()
            
            return generated_text
            
        except Exception as e:
            logger.error(f"Text generation failed: {e}")
            return f"Error generating text: {str(e)}"
    
    def search(self, query: str, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Semantic search through documents"""
        try:
            if not self.is_ready:
                raise RuntimeError("Model not ready")
            
            # Encode query
            query_embedding = self.embedding_model.encode(query)
            
            results = []
            for doc in documents:
                # Encode document content
                doc_embedding = self.embedding_model.encode(doc.get('content', ''))
                
                # Calculate similarity
                similarity = np.dot(query_embedding, doc_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
                )
                
                results.append({
                    'id': doc.get('id'),
                    'title': doc.get('title', ''),
                    'content': doc.get('content', ''),
                    'type': doc.get('type', 'document'),
                    'score': float(similarity),
                    'metadata': doc.get('metadata', {})
                })
            
            # Sort by similarity score
            results.sort(key=lambda x: x['score'], reverse=True)
            return results[:10]  # Return top 10 results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text"""
        try:
            if not self.is_ready:
                raise RuntimeError("Model not ready")
            
            result = self.sentiment_pipeline(text)[0]
            
            # Map sentiment labels
            label_mapping = {
                'LABEL_0': 'negative',
                'LABEL_1': 'neutral',
                'LABEL_2': 'positive'
            }
            
            return {
                'sentiment': label_mapping.get(result['label'], 'neutral'),
                'score': result['score']
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {'sentiment': 'neutral', 'score': 0.0}
    
    def summarize_text(self, text: str, max_length: int = 200) -> str:
        """Summarize text"""
        try:
            if not self.is_ready:
                raise RuntimeError("Model not ready")
            
            prompt = f"Summarize the following text in {max_length} characters or less:\n\n{text}\n\nSummary:"
            
            summary = self.generate_text(prompt, max_tokens=max_length//4, temperature=0.3)
            return summary.strip()
            
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            return text[:max_length] + "..." if len(text) > max_length else text
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text"""
        try:
            if not self.is_ready:
                raise RuntimeError("Model not ready")
            
            prompt = f"Extract the most important keywords from this text (comma-separated):\n\n{text}\n\nKeywords:"
            
            keywords_text = self.generate_text(prompt, max_tokens=100, temperature=0.3)
            keywords = [kw.strip() for kw in keywords_text.split(',') if kw.strip()]
            return keywords[:10]  # Return top 10 keywords
            
        except Exception as e:
            logger.error(f"Keyword extraction failed: {e}")
            return []
    
    def classify_content(self, text: str, categories: List[str]) -> Dict[str, Any]:
        """Classify content into categories"""
        try:
            if not self.is_ready:
                raise RuntimeError("Model not ready")
            
            prompt = f"Classify this text into one of these categories: {', '.join(categories)}\n\nText: {text}\n\nCategory:"
            
            classification = self.generate_text(prompt, max_tokens=50, temperature=0.3)
            category = classification.strip().lower()
            
            # Find best matching category
            best_match = categories[0]
            best_score = 0
            
            for cat in categories:
                if cat.lower() in category or category in cat.lower():
                    best_match = cat
                    best_score = 0.8
                    break
            
            return {
                'category': best_match,
                'confidence': best_score
            }
            
        except Exception as e:
            logger.error(f"Content classification failed: {e}")
            return {'category': categories[0], 'confidence': 0.0}
    
    def generate_recommendations(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized recommendations"""
        try:
            if not self.is_ready:
                raise RuntimeError("Model not ready")
            
            context_str = json.dumps(user_context, indent=2)
            prompt = f"Based on this user context, generate 5 personalized recommendations:\n\n{context_str}\n\nRecommendations:"
            
            recommendations_text = self.generate_text(prompt, max_tokens=500, temperature=0.7)
            
            # Parse recommendations (this is a simplified parser)
            recommendations = []
            lines = recommendations_text.split('\n')
            for line in lines:
                if line.strip() and any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'try']):
                    recommendations.append({
                        'id': f"rec_{len(recommendations)}",
                        'type': 'content',
                        'title': line.strip(),
                        'description': line.strip(),
                        'score': 0.8,
                        'reason': 'AI-generated recommendation'
                    })
            
            return recommendations[:5]
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return []
    
    def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Process an AI request"""
        start_time = time.time()
        
        try:
            request_type = request.get('type')
            prompt = request.get('prompt', '')
            context = request.get('context', {})
            options = request.get('options', {})
            
            if request_type == 'search':
                documents = context.get('documents', [])
                results = self.search(prompt, documents)
                data = results
                
            elif request_type == 'recommendation':
                data = self.generate_recommendations(context)
                
            elif request_type == 'generation':
                max_tokens = options.get('maxTokens', 2048)
                temperature = options.get('temperature', 0.7)
                data = self.generate_text(prompt, max_tokens, temperature)
                
            elif request_type == 'analysis':
                analysis_type = context.get('analysisType')
                
                if analysis_type == 'sentiment':
                    data = self.analyze_sentiment(prompt)
                elif analysis_type == 'keyword_extraction':
                    data = self.extract_keywords(prompt)
                elif analysis_type == 'classification':
                    categories = context.get('categories', [])
                    data = self.classify_content(prompt, categories)
                else:
                    data = self.analyze_sentiment(prompt)
                    
            elif request_type == 'summarization':
                max_length = options.get('maxTokens', 200)
                data = self.summarize_text(prompt, max_length)
                
            elif request_type == 'translation':
                target_language = context.get('targetLanguage', 'English')
                translation_prompt = f"Translate the following text to {target_language}:\n\n{prompt}\n\nTranslation:"
                data = self.generate_text(translation_prompt, max_tokens=len(prompt)*2, temperature=0.3)
                
            else:
                # Default to text generation
                data = self.generate_text(prompt, options.get('maxTokens', 2048), options.get('temperature', 0.7))
            
            latency = time.time() - start_time
            
            return {
                'success': True,
                'data': data,
                'metadata': {
                    'model': self.config.get('model', 'local'),
                    'tokens': len(prompt.split()),
                    'latency': latency
                }
            }
            
        except Exception as e:
            logger.error(f"Request processing failed: {e}")
            traceback.print_exc()
            
            return {
                'success': False,
                'error': str(e),
                'metadata': {
                    'model': self.config.get('model', 'local'),
                    'tokens': 0,
                    'latency': time.time() - start_time
                }
            }

def main():
    parser = argparse.ArgumentParser(description='CareConnect v5.0 AI Inference Service')
    parser.add_argument('--model', required=True, help='Path to the AI model')
    parser.add_argument('--config', default='{}', help='JSON configuration')
    
    args = parser.parse_args()
    
    try:
        # Parse config
        config = json.loads(args.config)
        
        # Initialize AI service
        ai_service = LocalAIInference(args.model, config)
        ai_service.initialize()
        
        # Send ready signal
        print(json.dumps({'type': 'ready'}), flush=True)
        
        # Process requests from stdin
        for line in sys.stdin:
            try:
                request = json.loads(line.strip())
                response = ai_service.process_request(request)
                
                # Send response
                print(json.dumps({
                    'type': 'response',
                    'requestId': request.get('id'),
                    'response': response
                }), flush=True)
                
            except json.JSONDecodeError:
                print(json.dumps({
                    'type': 'error',
                    'requestId': 'unknown',
                    'error': 'Invalid JSON request'
                }), flush=True)
            except Exception as e:
                print(json.dumps({
                    'type': 'error',
                    'requestId': request.get('id', 'unknown'),
                    'error': str(e)
                }), flush=True)
                
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        print(json.dumps({
            'type': 'error',
            'requestId': 'init',
            'error': str(e)
        }), flush=True)
        sys.exit(1)

if __name__ == '__main__':
    main()
