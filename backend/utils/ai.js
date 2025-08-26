const axios = require('axios');
const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

class AIUtils extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      aiEngineUrl: config.aiEngineUrl || 'http://localhost:5000',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };
    
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.lastHeartbeat = null;
    this.healthStatus = 'unknown';
    this.modelStatus = {};
    this.activeSessions = new Map();
    this.requestQueue = [];
    this.processingQueue = false;
  }

  // Connection management
  async connect() {
    try {
      this.connectionAttempts++;
      
      const response = await axios.get(`${this.config.aiEngineUrl}/health`, {
        timeout: this.config.timeout
      });
      
      if (response.status === 200) {
        this.isConnected = true;
        this.healthStatus = 'healthy';
        this.connectionAttempts = 0;
        this.lastHeartbeat = new Date();
        
        this.emit('connected');
        console.log('AI Engine connected successfully');
        
        // Start heartbeat
        this.startHeartbeat();
        
        return true;
      }
    } catch (error) {
      console.error('Failed to connect to AI Engine:', error.message);
      this.isConnected = false;
      this.healthStatus = 'unhealthy';
      
      this.emit('connection_failed', error);
      
      // Retry connection
      if (this.connectionAttempts < this.config.maxRetries) {
        setTimeout(() => this.connect(), this.config.retryDelay);
      }
      
      return false;
    }
  }

  async disconnect() {
    this.isConnected = false;
    this.healthStatus = 'disconnected';
    this.stopHeartbeat();
    this.emit('disconnected');
  }

  async reconnect() {
    await this.disconnect();
    return await this.connect();
  }

  // Heartbeat monitoring
  startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${this.config.aiEngineUrl}/health`, {
          timeout: 5000
        });
        
        if (response.status === 200) {
          this.lastHeartbeat = new Date();
          this.healthStatus = 'healthy';
          this.emit('heartbeat', { status: 'healthy', timestamp: this.lastHeartbeat });
        }
      } catch (error) {
        this.healthStatus = 'unhealthy';
        this.emit('heartbeat_failed', error);
        
        // Attempt reconnection if multiple heartbeats fail
        if (this.consecutiveHeartbeatFailures > 3) {
          await this.reconnect();
        }
      }
    }, 30000); // 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // AI Model management
  async getModelStatus() {
    try {
      const response = await axios.get(`${this.config.aiEngineUrl}/models/status`);
      this.modelStatus = response.data;
      return this.modelStatus;
    } catch (error) {
      console.error('Failed to get model status:', error.message);
      throw error;
    }
  }

  async loadModel(modelName, config = {}) {
    try {
      const response = await axios.post(`${this.config.aiEngineUrl}/models/load`, {
        model: modelName,
        config
      });
      
      this.emit('model_loaded', { model: modelName, config });
      return response.data;
    } catch (error) {
      console.error(`Failed to load model ${modelName}:`, error.message);
      throw error;
    }
  }

  async unloadModel(modelName) {
    try {
      const response = await axios.post(`${this.config.aiEngineUrl}/models/unload`, {
        model: modelName
      });
      
      this.emit('model_unloaded', { model: modelName });
      return response.data;
    } catch (error) {
      console.error(`Failed to unload model ${modelName}:`, error.message);
      throw error;
    }
  }

  // Session management
  createSession(sessionId, config = {}) {
    const session = {
      id: sessionId,
      config,
      createdAt: new Date(),
      lastActivity: new Date(),
      messages: [],
      context: {},
      status: 'active'
    };
    
    this.activeSessions.set(sessionId, session);
    this.emit('session_created', session);
    
    return session;
  }

  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  updateSession(sessionId, updates) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      Object.assign(session, updates, { lastActivity: new Date() });
      this.activeSessions.set(sessionId, session);
      this.emit('session_updated', session);
    }
    return session;
  }

  endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.endedAt = new Date();
      this.activeSessions.set(sessionId, session);
      this.emit('session_ended', session);
    }
    return session;
  }

  // AI Processing
  async processMessage(sessionId, message, options = {}) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add message to session
    const messageObj = {
      id: uuidv4(),
      content: message,
      timestamp: new Date(),
      type: 'user',
      metadata: options.metadata || {}
    };
    
    session.messages.push(messageObj);
    session.lastActivity = new Date();

    // Process with AI
    try {
      const response = await this.sendToAI(sessionId, message, options);
      
      // Add AI response to session
      const responseObj = {
        id: uuidv4(),
        content: response.content,
        timestamp: new Date(),
        type: 'ai',
        metadata: response.metadata || {},
        reasoning: response.reasoning,
        suggestions: response.suggestions
      };
      
      session.messages.push(responseObj);
      session.context = response.context || session.context;
      
      this.updateSession(sessionId, session);
      this.emit('message_processed', { sessionId, message: messageObj, response: responseObj });
      
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      this.emit('message_failed', { sessionId, message: messageObj, error });
      throw error;
    }
  }

  async sendToAI(sessionId, message, options = {}) {
    const session = this.getSession(sessionId);
    
    const requestData = {
      session_id: sessionId,
      message,
      context: session?.context || {},
      options: {
        persona: options.persona || 'balanced',
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        include_reasoning: options.includeReasoning !== false,
        include_suggestions: options.includeSuggestions !== false,
        ...options
      }
    };

    try {
      const response = await axios.post(`${this.config.aiEngineUrl}/process`, requestData, {
        timeout: this.config.timeout
      });
      
      return response.data;
    } catch (error) {
      console.error('AI Engine request failed:', error.message);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  // Batch processing
  async processBatch(messages, options = {}) {
    const batchId = uuidv4();
    const results = [];
    
    this.emit('batch_started', { batchId, count: messages.length });
    
    for (let i = 0; i < messages.length; i++) {
      try {
        const result = await this.processMessage(messages[i].sessionId, messages[i].message, options);
        results.push({ success: true, result, index: i });
      } catch (error) {
        results.push({ success: false, error: error.message, index: i });
      }
      
      // Progress update
      this.emit('batch_progress', { batchId, completed: i + 1, total: messages.length });
    }
    
    this.emit('batch_completed', { batchId, results });
    return results;
  }

  // Queue processing
  async addToQueue(message, priority = 'normal') {
    const queueItem = {
      id: uuidv4(),
      message,
      priority,
      timestamp: new Date(),
      status: 'pending'
    };
    
    this.requestQueue.push(queueItem);
    this.requestQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    this.emit('queued', queueItem);
    
    if (!this.processingQueue) {
      this.processQueue();
    }
    
    return queueItem.id;
  }

  async processQueue() {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.processingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const item = this.requestQueue.shift();
      
      try {
        item.status = 'processing';
        this.emit('processing', item);
        
        const result = await this.processMessage(item.message.sessionId, item.message.content, item.message.options);
        
        item.status = 'completed';
        item.result = result;
        this.emit('completed', item);
      } catch (error) {
        item.status = 'failed';
        item.error = error.message;
        this.emit('failed', item);
      }
    }
    
    this.processingQueue = false;
    this.emit('queue_empty');
  }

  // Video and Audio processing
  async processVideoFrame(sessionId, frameData, options = {}) {
    try {
      const response = await axios.post(`${this.config.aiEngineUrl}/video/process`, {
        session_id: sessionId,
        frame_data: frameData,
        options
      });
      
      return response.data;
    } catch (error) {
      console.error('Video processing failed:', error.message);
      throw error;
    }
  }

  async processAudioChunk(sessionId, audioData, options = {}) {
    try {
      const response = await axios.post(`${this.config.aiEngineUrl}/audio/process`, {
        session_id: sessionId,
        audio_data: audioData,
        options
      });
      
      return response.data;
    } catch (error) {
      console.error('Audio processing failed:', error.message);
      throw error;
    }
  }

  // Avatar management
  async createAvatar(config = {}) {
    try {
      const response = await axios.post(`${this.config.aiEngineUrl}/avatar/create`, config);
      return response.data;
    } catch (error) {
      console.error('Avatar creation failed:', error.message);
      throw error;
    }
  }

  async updateAvatar(avatarId, updates) {
    try {
      const response = await axios.put(`${this.config.aiEngineUrl}/avatar/${avatarId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Avatar update failed:', error.message);
      throw error;
    }
  }

  async destroyAvatar(avatarId) {
    try {
      const response = await axios.delete(`${this.config.aiEngineUrl}/avatar/${avatarId}`);
      return response.data;
    } catch (error) {
      console.error('Avatar destruction failed:', error.message);
      throw error;
    }
  }

  // Analytics and monitoring
  async getAnalytics(timeRange = '24h') {
    try {
      const response = await axios.get(`${this.config.aiEngineUrl}/analytics`, {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get analytics:', error.message);
      throw error;
    }
  }

  async getPerformanceMetrics() {
    try {
      const response = await axios.get(`${this.config.aiEngineUrl}/performance`);
      return response.data;
    } catch (error) {
      console.error('Failed to get performance metrics:', error.message);
      throw error;
    }
  }

  // Utility methods
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string');
    }
    
    if (message.length > 10000) {
      throw new Error('Message too long (max 10000 characters)');
    }
    
    return true;
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Cleanup
  cleanup() {
    this.stopHeartbeat();
    this.activeSessions.clear();
    this.requestQueue = [];
    this.processingQueue = false;
    this.removeAllListeners();
  }

  // Get status
  getStatus() {
    return {
      isConnected: this.isConnected,
      healthStatus: this.healthStatus,
      lastHeartbeat: this.lastHeartbeat,
      activeSessions: this.activeSessions.size,
      queueLength: this.requestQueue.length,
      processingQueue: this.processingQueue,
      modelStatus: this.modelStatus
    };
  }
}

module.exports = AIUtils;
