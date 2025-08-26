#!/usr/bin/env python3
"""
CareConnect v5.0 - AI Memory Engine
Consolidates data, builds embeddings, and updates Personal Knowledge Graph
"""

import os
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib
import pickle
import sqlite3
from concurrent.futures import ThreadPoolExecutor
import threading

# AI/ML Libraries
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN
from sklearn.decomposition import PCA
import networkx as nx
from scipy.spatial.distance import cosine
import faiss

# NLP Libraries
import spacy
from textblob import TextBlob
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Data Processing
import yaml
import sqlalchemy as sa
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import redis
import elasticsearch
from elasticsearch import Elasticsearch

# Utilities
import psutil
import schedule
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import zmq
import msgpack

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/memory_engine.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class MemoryNode:
    """Represents a node in the knowledge graph"""
    id: str
    type: str  # file, text, image, audio, video, user_input, health_data, etc.
    content: str
    metadata: Dict[str, Any]
    embeddings: Optional[np.ndarray] = None
    keywords: List[str] = None
    summary: Optional[str] = None
    confidence: float = 1.0
    created_at: datetime = None
    updated_at: datetime = None
    access_count: int = 0
    last_accessed: datetime = None
    tags: List[str] = None
    relationships: List[str] = None  # IDs of related nodes
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()
        if self.last_accessed is None:
            self.last_accessed = datetime.now()
        if self.keywords is None:
            self.keywords = []
        if self.tags is None:
            self.tags = []
        if self.relationships is None:
            self.relationships = []

@dataclass
class MemoryRelationship:
    """Represents a relationship between memory nodes"""
    id: str
    source_id: str
    target_id: str
    relationship_type: str  # similar, contains, references, etc.
    strength: float = 1.0
    metadata: Dict[str, Any] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.metadata is None:
            self.metadata = {}

class MemoryEngine:
    """AI Memory Engine for building and maintaining Personal Knowledge Graph"""
    
    def __init__(self, config_path: str = "config.yaml"):
        self.config = self._load_config(config_path)
        self.model = None
        self.vectorizer = None
        self.nlp = None
        self.lemmatizer = None
        self.stop_words = None
        self.knowledge_graph = nx.DiGraph()
        self.memory_nodes: Dict[str, MemoryNode] = {}
        self.embeddings_index = None
        self.db_session = None
        self.redis_client = None
        self.es_client = None
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.lock = threading.RLock()
        
        # Initialize components
        self._initialize_nlp()
        self._initialize_embeddings()
        self._initialize_database()
        self._initialize_search()
        self._load_existing_memory()
        
        logger.info("Memory Engine initialized successfully")
    
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            return config.get('memory_engine', {})
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return {}
    
    def _initialize_nlp(self):
        """Initialize NLP components"""
        try:
            # Download required NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
            
            # Load spaCy model
            model_name = self.config.get('spacy_model', 'en_core_web_sm')
            try:
                self.nlp = spacy.load(model_name)
            except OSError:
                logger.warning(f"spaCy model {model_name} not found, using basic tokenization")
                self.nlp = None
            
            # Initialize other NLP components
            self.lemmatizer = WordNetLemmatizer()
            self.stop_words = set(stopwords.words('english'))
            
            logger.info("NLP components initialized")
        except Exception as e:
            logger.error(f"Error initializing NLP: {e}")
    
    def _initialize_embeddings(self):
        """Initialize embedding models"""
        try:
            # Load sentence transformer model
            model_name = self.config.get('embedding_model', 'all-MiniLM-L6-v2')
            self.model = SentenceTransformer(model_name)
            
            # Initialize TF-IDF vectorizer
            self.vectorizer = TfidfVectorizer(
                max_features=10000,
                stop_words='english',
                ngram_range=(1, 2)
            )
            
            # Initialize FAISS index
            dimension = self.model.get_sentence_embedding_dimension()
            self.embeddings_index = faiss.IndexFlatIP(dimension)
            
            logger.info(f"Embedding models initialized with dimension {dimension}")
        except Exception as e:
            logger.error(f"Error initializing embeddings: {e}")
    
    def _initialize_database(self):
        """Initialize database connections"""
        try:
            # SQLite for metadata
            db_path = self.config.get('database_path', 'data/memory.db')
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            
            engine = create_engine(f'sqlite:///{db_path}')
            Session = sessionmaker(bind=engine)
            self.db_session = Session()
            
            # Create tables
            self._create_tables(engine)
            
            # Redis for caching
            redis_config = self.config.get('redis', {})
            if redis_config:
                self.redis_client = redis.Redis(
                    host=redis_config.get('host', 'localhost'),
                    port=redis_config.get('port', 6379),
                    db=redis_config.get('db', 0)
                )
            
            logger.info("Database connections initialized")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
    
    def _create_tables(self, engine):
        """Create database tables"""
        try:
            with engine.connect() as conn:
                # Memory nodes table
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS memory_nodes (
                        id TEXT PRIMARY KEY,
                        type TEXT NOT NULL,
                        content TEXT,
                        metadata TEXT,
                        embeddings BLOB,
                        keywords TEXT,
                        summary TEXT,
                        confidence REAL DEFAULT 1.0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        access_count INTEGER DEFAULT 0,
                        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        tags TEXT,
                        relationships TEXT
                    )
                """))
                
                # Memory relationships table
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS memory_relationships (
                        id TEXT PRIMARY KEY,
                        source_id TEXT NOT NULL,
                        target_id TEXT NOT NULL,
                        relationship_type TEXT NOT NULL,
                        strength REAL DEFAULT 1.0,
                        metadata TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (source_id) REFERENCES memory_nodes (id),
                        FOREIGN KEY (target_id) REFERENCES memory_nodes (id)
                    )
                """))
                
                # Create indexes
                conn.execute(text("CREATE INDEX IF NOT EXISTS idx_memory_nodes_type ON memory_nodes(type)"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS idx_memory_nodes_tags ON memory_nodes(tags)"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS idx_memory_relationships_source ON memory_relationships(source_id)"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS idx_memory_relationships_target ON memory_relationships(target_id)"))
                
                conn.commit()
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
    
    def _initialize_search(self):
        """Initialize search engine"""
        try:
            es_config = self.config.get('elasticsearch', {})
            if es_config:
                self.es_client = Elasticsearch([es_config])
                
                # Create index if it doesn't exist
                if not self.es_client.indices.exists(index='memory'):
                    self.es_client.indices.create(
                        index='memory',
                        body={
                            'mappings': {
                                'properties': {
                                    'content': {'type': 'text'},
                                    'keywords': {'type': 'keyword'},
                                    'tags': {'type': 'keyword'},
                                    'type': {'type': 'keyword'},
                                    'embeddings': {'type': 'dense_vector', 'dims': 384}
                                }
                            }
                        }
                    )
            
            logger.info("Search engine initialized")
        except Exception as e:
            logger.error(f"Error initializing search: {e}")
    
    def _load_existing_memory(self):
        """Load existing memory nodes from database"""
        try:
            with self.db_session.begin():
                result = self.db_session.execute(text("SELECT * FROM memory_nodes"))
                for row in result:
                    node = MemoryNode(
                        id=row.id,
                        type=row.type,
                        content=row.content,
                        metadata=json.loads(row.metadata) if row.metadata else {},
                        embeddings=np.frombuffer(row.embeddings) if row.embeddings else None,
                        keywords=json.loads(row.keywords) if row.keywords else [],
                        summary=row.summary,
                        confidence=row.confidence,
                        created_at=datetime.fromisoformat(row.created_at),
                        updated_at=datetime.fromisoformat(row.updated_at),
                        access_count=row.access_count,
                        last_accessed=datetime.fromisoformat(row.last_accessed),
                        tags=json.loads(row.tags) if row.tags else [],
                        relationships=json.loads(row.relationships) if row.relationships else []
                    )
                    self.memory_nodes[node.id] = node
                    self.knowledge_graph.add_node(node.id, **asdict(node))
            
            logger.info(f"Loaded {len(self.memory_nodes)} memory nodes")
        except Exception as e:
            logger.error(f"Error loading existing memory: {e}")
    
    async def process_file(self, file_path: str, file_metadata: Dict[str, Any]) -> str:
        """Process a file and add it to memory"""
        try:
            file_id = self._generate_file_id(file_path, file_metadata)
            
            # Check if already processed
            if file_id in self.memory_nodes:
                logger.info(f"File {file_path} already processed")
                return file_id
            
            # Extract content based on file type
            content = await self._extract_file_content(file_path, file_metadata)
            
            # Create memory node
            node = MemoryNode(
                id=file_id,
                type='file',
                content=content,
                metadata={
                    'file_path': file_path,
                    'file_size': file_metadata.get('size', 0),
                    'mime_type': file_metadata.get('type', ''),
                    'original_name': file_metadata.get('name', ''),
                    **file_metadata
                },
                tags=file_metadata.get('tags', [])
            )
            
            # Process content
            await self._process_node_content(node)
            
            # Add to memory
            await self._add_memory_node(node)
            
            logger.info(f"Processed file {file_path} -> {file_id}")
            return file_id
            
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}")
            raise
    
    async def process_text(self, text: str, metadata: Dict[str, Any] = None) -> str:
        """Process text and add it to memory"""
        try:
            text_id = self._generate_text_id(text, metadata)
            
            # Create memory node
            node = MemoryNode(
                id=text_id,
                type='text',
                content=text,
                metadata=metadata or {},
                tags=metadata.get('tags', []) if metadata else []
            )
            
            # Process content
            await self._process_node_content(node)
            
            # Add to memory
            await self._add_memory_node(node)
            
            logger.info(f"Processed text -> {text_id}")
            return text_id
            
        except Exception as e:
            logger.error(f"Error processing text: {e}")
            raise
    
    async def process_user_input(self, user_id: str, input_data: Dict[str, Any]) -> str:
        """Process user input and add it to memory"""
        try:
            input_id = self._generate_input_id(user_id, input_data)
            
            # Extract content from input
            content = self._extract_input_content(input_data)
            
            # Create memory node
            node = MemoryNode(
                id=input_id,
                type='user_input',
                content=content,
                metadata={
                    'user_id': user_id,
                    'input_type': input_data.get('type', 'text'),
                    'timestamp': input_data.get('timestamp', datetime.now().isoformat()),
                    **input_data
                },
                tags=input_data.get('tags', [])
            )
            
            # Process content
            await self._process_node_content(node)
            
            # Add to memory
            await self._add_memory_node(node)
            
            logger.info(f"Processed user input -> {input_id}")
            return input_id
            
        except Exception as e:
            logger.error(f"Error processing user input: {e}")
            raise
    
    async def _process_node_content(self, node: MemoryNode):
        """Process the content of a memory node"""
        try:
            # Generate embeddings
            if node.content:
                node.embeddings = self.model.encode(node.content)
            
            # Extract keywords
            node.keywords = self._extract_keywords(node.content)
            
            # Generate summary
            node.summary = self._generate_summary(node.content)
            
            # Update tags
            if not node.tags:
                node.tags = self._suggest_tags(node.content, node.keywords)
            
            logger.debug(f"Processed content for node {node.id}")
            
        except Exception as e:
            logger.error(f"Error processing node content: {e}")
    
    async def _add_memory_node(self, node: MemoryNode):
        """Add a memory node to the system"""
        try:
            with self.lock:
                # Add to in-memory storage
                self.memory_nodes[node.id] = node
                self.knowledge_graph.add_node(node.id, **asdict(node))
                
                # Add to database
                await self._save_node_to_db(node)
                
                # Add to search index
                await self._index_node(node)
                
                # Update embeddings index
                if node.embeddings is not None:
                    self.embeddings_index.add(node.embeddings.reshape(1, -1))
                
                # Find relationships
                await self._find_relationships(node)
            
            logger.debug(f"Added memory node {node.id}")
            
        except Exception as e:
            logger.error(f"Error adding memory node: {e}")
    
    async def _save_node_to_db(self, node: MemoryNode):
        """Save node to database"""
        try:
            with self.db_session.begin():
                self.db_session.execute(text("""
                    INSERT OR REPLACE INTO memory_nodes 
                    (id, type, content, metadata, embeddings, keywords, summary, 
                     confidence, created_at, updated_at, access_count, last_accessed, tags, relationships)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """), (
                    node.id, node.type, node.content, json.dumps(node.metadata),
                    node.embeddings.tobytes() if node.embeddings is not None else None,
                    json.dumps(node.keywords), node.summary, node.confidence,
                    node.created_at.isoformat(), node.updated_at.isoformat(),
                    node.access_count, node.last_accessed.isoformat(),
                    json.dumps(node.tags), json.dumps(node.relationships)
                ))
        except Exception as e:
            logger.error(f"Error saving node to database: {e}")
    
    async def _index_node(self, node: MemoryNode):
        """Index node in search engine"""
        try:
            if self.es_client:
                doc = {
                    'content': node.content,
                    'keywords': node.keywords,
                    'tags': node.tags,
                    'type': node.type,
                    'embeddings': node.embeddings.tolist() if node.embeddings is not None else None
                }
                self.es_client.index(index='memory', id=node.id, body=doc)
        except Exception as e:
            logger.error(f"Error indexing node: {e}")
    
    async def _find_relationships(self, node: MemoryNode):
        """Find relationships between the new node and existing nodes"""
        try:
            if node.embeddings is None:
                return
            
            # Find similar nodes
            similarities = []
            for existing_id, existing_node in self.memory_nodes.items():
                if existing_id != node.id and existing_node.embeddings is not None:
                    similarity = 1 - cosine(node.embeddings, existing_node.embeddings)
                    if similarity > 0.7:  # Threshold for similarity
                        similarities.append((existing_id, similarity))
            
            # Create relationships
            for related_id, strength in similarities[:5]:  # Top 5 most similar
                relationship = MemoryRelationship(
                    id=f"{node.id}_{related_id}",
                    source_id=node.id,
                    target_id=related_id,
                    relationship_type='similar',
                    strength=strength
                )
                
                # Add to graph
                self.knowledge_graph.add_edge(
                    node.id, related_id,
                    relationship_type='similar',
                    strength=strength
                )
                
                # Save to database
                await self._save_relationship_to_db(relationship)
                
                # Update node relationships
                node.relationships.append(related_id)
                self.memory_nodes[related_id].relationships.append(node.id)
            
            logger.debug(f"Found {len(similarities)} relationships for node {node.id}")
            
        except Exception as e:
            logger.error(f"Error finding relationships: {e}")
    
    async def _save_relationship_to_db(self, relationship: MemoryRelationship):
        """Save relationship to database"""
        try:
            with self.db_session.begin():
                self.db_session.execute(text("""
                    INSERT OR REPLACE INTO memory_relationships 
                    (id, source_id, target_id, relationship_type, strength, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """), (
                    relationship.id, relationship.source_id, relationship.target_id,
                    relationship.relationship_type, relationship.strength,
                    json.dumps(relationship.metadata), relationship.created_at.isoformat()
                ))
        except Exception as e:
            logger.error(f"Error saving relationship to database: {e}")
    
    async def search(self, query: str, limit: int = 10, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search memory nodes"""
        try:
            # Generate query embedding
            query_embedding = self.model.encode(query)
            
            # Search in FAISS index
            D, I = self.embeddings_index.search(query_embedding.reshape(1, -1), limit)
            
            results = []
            for i, (distance, idx) in enumerate(zip(D[0], I[0])):
                if idx < len(self.memory_nodes):
                    node_id = list(self.memory_nodes.keys())[idx]
                    node = self.memory_nodes[node_id]
                    
                    # Apply filters
                    if filters and not self._apply_filters(node, filters):
                        continue
                    
                    results.append({
                        'id': node.id,
                        'type': node.type,
                        'content': node.content[:200] + '...' if len(node.content) > 200 else node.content,
                        'summary': node.summary,
                        'keywords': node.keywords,
                        'tags': node.tags,
                        'similarity': float(distance),
                        'metadata': node.metadata,
                        'created_at': node.created_at.isoformat()
                    })
            
            # Sort by similarity
            results.sort(key=lambda x: x['similarity'], reverse=True)
            
            logger.info(f"Search for '{query}' returned {len(results)} results")
            return results
            
        except Exception as e:
            logger.error(f"Error searching memory: {e}")
            return []
    
    async def get_context(self, node_id: str, depth: int = 2) -> Dict[str, Any]:
        """Get context around a specific node"""
        try:
            if node_id not in self.memory_nodes:
                return {}
            
            node = self.memory_nodes[node_id]
            
            # Get related nodes
            related_nodes = []
            for related_id in node.relationships:
                if related_id in self.memory_nodes:
                    related_nodes.append(self.memory_nodes[related_id])
            
            # Get path to related nodes
            context = {
                'node': {
                    'id': node.id,
                    'type': node.type,
                    'content': node.content,
                    'summary': node.summary,
                    'keywords': node.keywords,
                    'tags': node.tags,
                    'metadata': node.metadata
                },
                'related_nodes': [
                    {
                        'id': n.id,
                        'type': n.type,
                        'summary': n.summary,
                        'keywords': n.keywords,
                        'tags': n.tags
                    }
                    for n in related_nodes
                ],
                'graph_stats': {
                    'total_nodes': len(self.memory_nodes),
                    'total_relationships': self.knowledge_graph.number_of_edges(),
                    'node_degree': self.knowledge_graph.degree(node_id)
                }
            }
            
            return context
            
        except Exception as e:
            logger.error(f"Error getting context: {e}")
            return {}
    
    async def update_memory(self, node_id: str, updates: Dict[str, Any]):
        """Update a memory node"""
        try:
            if node_id not in self.memory_nodes:
                raise ValueError(f"Node {node_id} not found")
            
            node = self.memory_nodes[node_id]
            
            # Apply updates
            for key, value in updates.items():
                if hasattr(node, key):
                    setattr(node, key, value)
            
            node.updated_at = datetime.now()
            
            # Save to database
            await self._save_node_to_db(node)
            
            # Update search index
            await self._index_node(node)
            
            logger.info(f"Updated memory node {node_id}")
            
        except Exception as e:
            logger.error(f"Error updating memory: {e}")
            raise
    
    async def delete_memory(self, node_id: str):
        """Delete a memory node"""
        try:
            if node_id not in self.memory_nodes:
                return
            
            # Remove from in-memory storage
            del self.memory_nodes[node_id]
            self.knowledge_graph.remove_node(node_id)
            
            # Remove from database
            with self.db_session.begin():
                self.db_session.execute(text("DELETE FROM memory_nodes WHERE id = ?"), (node_id,))
                self.db_session.execute(text("DELETE FROM memory_relationships WHERE source_id = ? OR target_id = ?"), 
                                      (node_id, node_id))
            
            # Remove from search index
            if self.es_client:
                self.es_client.delete(index='memory', id=node_id)
            
            logger.info(f"Deleted memory node {node_id}")
            
        except Exception as e:
            logger.error(f"Error deleting memory: {e}")
    
    def _extract_file_content(self, file_path: str, metadata: Dict[str, Any]) -> str:
        """Extract content from file based on type"""
        try:
            mime_type = metadata.get('type', '')
            
            if mime_type.startswith('text/'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            
            elif mime_type == 'application/pdf':
                # Use PyPDF2 or similar for PDF extraction
                return f"PDF file: {metadata.get('name', '')}"
            
            elif mime_type.startswith('image/'):
                # Extract text from image using OCR
                return f"Image file: {metadata.get('name', '')}"
            
            elif mime_type.startswith('audio/'):
                # Extract transcript from audio
                return f"Audio file: {metadata.get('name', '')}"
            
            elif mime_type.startswith('video/'):
                # Extract transcript and description from video
                return f"Video file: {metadata.get('name', '')}"
            
            else:
                return f"File: {metadata.get('name', '')}"
                
        except Exception as e:
            logger.error(f"Error extracting file content: {e}")
            return f"Error reading file: {metadata.get('name', '')}"
    
    def _extract_input_content(self, input_data: Dict[str, Any]) -> str:
        """Extract content from user input"""
        input_type = input_data.get('type', 'text')
        
        if input_type == 'text':
            return input_data.get('content', '')
        elif input_type == 'voice':
            return input_data.get('transcript', '')
        elif input_type == 'image':
            return f"Image input: {input_data.get('description', '')}"
        else:
            return str(input_data.get('content', ''))
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text"""
        try:
            if not text:
                return []
            
            # Tokenize and clean
            tokens = word_tokenize(text.lower())
            tokens = [token for token in tokens if token.isalnum() and token not in self.stop_words]
            
            # Lemmatize
            tokens = [self.lemmatizer.lemmatize(token) for token in tokens]
            
            # Use TF-IDF to find important terms
            if len(tokens) > 1:
                tfidf_matrix = self.vectorizer.fit_transform([' '.join(tokens)])
                feature_names = self.vectorizer.get_feature_names_out()
                scores = tfidf_matrix.toarray()[0]
                
                # Get top keywords
                keyword_indices = np.argsort(scores)[-10:]  # Top 10
                keywords = [feature_names[i] for i in keyword_indices if scores[i] > 0]
            else:
                keywords = tokens
            
            return keywords[:10]  # Limit to 10 keywords
            
        except Exception as e:
            logger.error(f"Error extracting keywords: {e}")
            return []
    
    def _generate_summary(self, text: str) -> str:
        """Generate summary of text"""
        try:
            if not text or len(text) < 100:
                return text
            
            # Use TextBlob for basic summarization
            blob = TextBlob(text)
            sentences = blob.sentences
            
            if len(sentences) <= 3:
                return text
            
            # Select top sentences based on word frequency
            word_freq = {}
            for sentence in sentences:
                for word in sentence.words:
                    word = word.lower()
                    if word not in self.stop_words and len(word) > 2:
                        word_freq[word] = word_freq.get(word, 0) + 1
            
            # Score sentences
            sentence_scores = {}
            for sentence in sentences:
                score = sum(word_freq.get(word.lower(), 0) for word in sentence.words)
                sentence_scores[sentence] = score
            
            # Get top sentences
            top_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)[:3]
            summary = ' '.join([sentence[0] for sentence in top_sentences])
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return text[:200] + '...' if len(text) > 200 else text
    
    def _suggest_tags(self, content: str, keywords: List[str]) -> List[str]:
        """Suggest tags based on content and keywords"""
        try:
            tags = []
            
            # Add keywords as tags
            tags.extend(keywords[:5])
            
            # Add content type tags
            if any(word in content.lower() for word in ['health', 'medical', 'symptom']):
                tags.append('health')
            if any(word in content.lower() for word in ['money', 'finance', 'budget']):
                tags.append('finance')
            if any(word in content.lower() for word in ['learn', 'study', 'course']):
                tags.append('learning')
            if any(word in content.lower() for word in ['create', 'art', 'project']):
                tags.append('creative')
            if any(word in content.lower() for word in ['friend', 'social', 'meet']):
                tags.append('social')
            
            return list(set(tags))
            
        except Exception as e:
            logger.error(f"Error suggesting tags: {e}")
            return []
    
    def _apply_filters(self, node: MemoryNode, filters: Dict[str, Any]) -> bool:
        """Apply filters to a node"""
        try:
            for key, value in filters.items():
                if key == 'type' and node.type != value:
                    return False
                elif key == 'tags' and not any(tag in node.tags for tag in value):
                    return False
                elif key == 'date_range':
                    start_date, end_date = value
                    if not (start_date <= node.created_at <= end_date):
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error applying filters: {e}")
            return True
    
    def _generate_file_id(self, file_path: str, metadata: Dict[str, Any]) -> str:
        """Generate unique ID for file"""
        content = f"{file_path}_{metadata.get('size', 0)}_{metadata.get('lastModified', 0)}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    def _generate_text_id(self, text: str, metadata: Dict[str, Any]) -> str:
        """Generate unique ID for text"""
        content = f"{text[:100]}_{metadata.get('timestamp', datetime.now().isoformat())}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    def _generate_input_id(self, user_id: str, input_data: Dict[str, Any]) -> str:
        """Generate unique ID for user input"""
        content = f"{user_id}_{input_data.get('timestamp', datetime.now().isoformat())}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get memory engine statistics"""
        try:
            return {
                'total_nodes': len(self.memory_nodes),
                'total_relationships': self.knowledge_graph.number_of_edges(),
                'nodes_by_type': self._count_nodes_by_type(),
                'embeddings_index_size': self.embeddings_index.ntotal if self.embeddings_index else 0,
                'memory_usage_mb': psutil.Process().memory_info().rss / 1024 / 1024,
                'last_updated': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {}
    
    def _count_nodes_by_type(self) -> Dict[str, int]:
        """Count nodes by type"""
        counts = {}
        for node in self.memory_nodes.values():
            counts[node.type] = counts.get(node.type, 0) + 1
        return counts
    
    async def cleanup_old_memory(self, days: int = 30):
        """Clean up old memory nodes"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            nodes_to_delete = []
            
            for node_id, node in self.memory_nodes.items():
                if node.last_accessed < cutoff_date and node.access_count < 5:
                    nodes_to_delete.append(node_id)
            
            for node_id in nodes_to_delete:
                await self.delete_memory(node_id)
            
            logger.info(f"Cleaned up {len(nodes_to_delete)} old memory nodes")
            
        except Exception as e:
            logger.error(f"Error cleaning up old memory: {e}")
    
    def start_background_tasks(self):
        """Start background maintenance tasks"""
        try:
            # Schedule cleanup task
            schedule.every().day.at("02:00").do(
                lambda: asyncio.run(self.cleanup_old_memory())
            )
            
            # Start scheduler in background thread
            def run_scheduler():
                while True:
                    schedule.run_pending()
                    time.sleep(60)
            
            scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
            scheduler_thread.start()
            
            logger.info("Background tasks started")
            
        except Exception as e:
            logger.error(f"Error starting background tasks: {e}")
    
    def shutdown(self):
        """Shutdown the memory engine"""
        try:
            # Close database session
            if self.db_session:
                self.db_session.close()
            
            # Close Redis connection
            if self.redis_client:
                self.redis_client.close()
            
            # Close Elasticsearch connection
            if self.es_client:
                self.es_client.close()
            
            # Shutdown executor
            self.executor.shutdown(wait=True)
            
            logger.info("Memory engine shutdown complete")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

# Main execution
if __name__ == "__main__":
    async def main():
        # Initialize memory engine
        engine = MemoryEngine()
        
        try:
            # Start background tasks
            engine.start_background_tasks()
            
            # Example usage
            text_id = await engine.process_text(
                "I'm feeling stressed about my upcoming presentation. I need to practice more.",
                {'user_id': 'user123', 'tags': ['stress', 'presentation']}
            )
            
            # Search
            results = await engine.search("stress presentation")
            print(f"Search results: {len(results)} found")
            
            # Get context
            context = await engine.get_context(text_id)
            print(f"Context: {context}")
            
            # Keep running
            while True:
                await asyncio.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("Shutting down...")
        finally:
            engine.shutdown()
    
    asyncio.run(main())
