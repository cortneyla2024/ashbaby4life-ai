const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./utils/logger');
const config = require('./config/config');

class AIBridge {
    constructor() {
        this.pythonProcess = null;
        this.isConnected = false;
        this.messageQueue = [];
        this.responseCallbacks = new Map();
        this.messageId = 0;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // 1 second
    }

    /**
     * Initialize the AI bridge and start the Python AI engine
     */
    async initialize() {
        try {
            logger.info('Initializing AI Bridge...');
            
            // Check if Python AI engine files exist
            const aiEnginePath = path.join(__dirname, '..', 'ai_engine');
            const modelPath = path.join(aiEnginePath, 'model.py');
            
            try {
                await fs.access(modelPath);
            } catch (error) {
                logger.warn('AI engine files not found, using mock AI responses');
                this.isConnected = false;
                return;
            }

            // Start Python AI engine process
            await this.startPythonProcess();
            
            // Set up message handling
            this.setupMessageHandling();
            
            // Test connection
            await this.testConnection();
            
            logger.info('AI Bridge initialized successfully');
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'initialize' });
            this.isConnected = false;
        }
    }

    /**
     * Start the Python AI engine process
     */
    async startPythonProcess() {
        try {
            const aiEnginePath = path.join(__dirname, '..', 'ai_engine');
            const pythonScript = path.join(aiEnginePath, 'model.py');
            
            // Check if Python script exists
            try {
                await fs.access(pythonScript);
            } catch (error) {
                throw new Error('AI engine Python script not found');
            }

            // Start Python process
            this.pythonProcess = spawn('python', [pythonScript], {
                cwd: aiEnginePath,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    PYTHONPATH: aiEnginePath
                }
            });

            // Handle process events
            this.pythonProcess.on('error', (error) => {
                logger.errorWithContext(error, { component: 'AI Bridge', operation: 'pythonProcessError' });
                this.handleProcessError();
            });

            this.pythonProcess.on('exit', (code, signal) => {
                logger.warn(`Python AI engine process exited with code ${code} and signal ${signal}`);
                this.handleProcessExit();
            });

            // Handle stdout
            this.pythonProcess.stdout.on('data', (data) => {
                this.handlePythonOutput(data.toString());
            });

            // Handle stderr
            this.pythonProcess.stderr.on('data', (data) => {
                logger.warn(`Python AI engine stderr: ${data.toString()}`);
            });

            logger.info('Python AI engine process started');
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'startPythonProcess' });
            throw error;
        }
    }

    /**
     * Set up message handling for communication with Python process
     */
    setupMessageHandling() {
        this.outputBuffer = '';
        
        // Handle incoming data from Python process
        this.pythonProcess.stdout.on('data', (data) => {
            this.outputBuffer += data.toString();
            
            // Process complete messages
            const messages = this.outputBuffer.split('\n');
            this.outputBuffer = messages.pop() || ''; // Keep incomplete message in buffer
            
            messages.forEach(message => {
                if (message.trim()) {
                    this.processPythonMessage(message.trim());
                }
            });
        });
    }

    /**
     * Process messages received from Python process
     */
    processPythonMessage(message) {
        try {
            const parsedMessage = JSON.parse(message);
            
            if (parsedMessage.type === 'response') {
                const callback = this.responseCallbacks.get(parsedMessage.messageId);
                if (callback) {
                    callback(parsedMessage.data);
                    this.responseCallbacks.delete(parsedMessage.messageId);
                }
            } else if (parsedMessage.type === 'status') {
                logger.info(`AI Engine Status: ${parsedMessage.status}`);
                if (parsedMessage.status === 'ready') {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                }
            } else if (parsedMessage.type === 'error') {
                logger.error(`AI Engine Error: ${parsedMessage.error}`);
            }
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'processPythonMessage' });
        }
    }

    /**
     * Send message to Python AI engine
     */
    async sendMessage(type, data) {
        return new Promise((resolve, reject) => {
            if (!this.pythonProcess || !this.isConnected) {
                reject(new Error('AI engine not connected'));
                return;
            }

            const messageId = ++this.messageId;
            const message = {
                messageId,
                type,
                data,
                timestamp: new Date().toISOString()
            };

            // Store callback for response
            this.responseCallbacks.set(messageId, resolve);

            // Send message to Python process
            this.pythonProcess.stdin.write(JSON.stringify(message) + '\n');

            // Set timeout for response
            setTimeout(() => {
                if (this.responseCallbacks.has(messageId)) {
                    this.responseCallbacks.delete(messageId);
                    reject(new Error('AI engine response timeout'));
                }
            }, config.ai.timeout || 30000);
        });
    }

    /**
     * Test connection to AI engine
     */
    async testConnection() {
        try {
            const response = await this.sendMessage('ping', {});
            logger.info('AI engine connection test successful');
            return response;
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'testConnection' });
            throw error;
        }
    }

    /**
     * Send text message to AI engine for processing
     */
    async processTextMessage(message, context = {}) {
        try {
            const response = await this.sendMessage('process_text', {
                message,
                context,
                user_id: context.user_id,
                session_id: context.session_id
            });
            
            return response;
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'processTextMessage' });
            return this.getMockResponse(message, context);
        }
    }

    /**
     * Get AI suggestions based on context
     */
    async getSuggestions(context = {}) {
        try {
            const response = await this.sendMessage('get_suggestions', {
                context,
                user_id: context.user_id,
                session_id: context.session_id
            });
            
            return response;
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'getSuggestions' });
            return this.getMockSuggestions(context);
        }
    }

    /**
     * Process file with AI engine
     */
    async processFile(filePath, fileType, context = {}) {
        try {
            const response = await this.sendMessage('process_file', {
                file_path: filePath,
                file_type: fileType,
                context,
                user_id: context.user_id,
                session_id: context.session_id
            });
            
            return response;
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'processFile' });
            return this.getMockFileResponse(filePath, fileType, context);
        }
    }

    /**
     * Get AI model information
     */
    async getModelInfo() {
        try {
            const response = await this.sendMessage('get_model_info', {});
            return response;
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'getModelInfo' });
            return this.getMockModelInfo();
        }
    }

    /**
     * Update AI model
     */
    async updateModel(updateConfig = {}) {
        try {
            const response = await this.sendMessage('update_model', updateConfig);
            return response;
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'updateModel' });
            throw error;
        }
    }

    /**
     * Handle Python process errors
     */
    handleProcessError() {
        this.isConnected = false;
        this.attemptReconnect();
    }

    /**
     * Handle Python process exit
     */
    handleProcessExit() {
        this.isConnected = false;
        this.attemptReconnect();
    }

    /**
     * Attempt to reconnect to Python process
     */
    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error('Max reconnection attempts reached for AI engine');
            return;
        }

        this.reconnectAttempts++;
        logger.info(`Attempting to reconnect to AI engine (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(async () => {
            try {
                await this.initialize();
            } catch (error) {
                logger.errorWithContext(error, { component: 'AI Bridge', operation: 'attemptReconnect' });
                this.attemptReconnect();
            }
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    /**
     * Get mock response when AI engine is not available
     */
    getMockResponse(message, context = {}) {
        const responses = [
            "I understand you're asking about that. Let me help you with some information.",
            "That's an interesting question. Here's what I can tell you about it.",
            "I'd be happy to help you with that. Let me provide some guidance.",
            "That's a great topic to explore. Here are some thoughts on the matter.",
            "I can see you're looking for information about this. Let me share what I know."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            response: randomResponse,
            confidence: 0.7,
            model: 'mock-ai-engine',
            processing_time: Math.random() * 1000,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get mock suggestions when AI engine is not available
     */
    getMockSuggestions(context = {}) {
        const suggestions = [
            "How can I help you with your health goals today?",
            "Would you like to explore some creative projects?",
            "I can help you with financial planning if you'd like.",
            "Let's work on building community connections.",
            "Is there something specific you'd like to learn about?"
        ];

        return {
            suggestions: suggestions.slice(0, 3),
            context: context,
            model: 'mock-ai-engine',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get mock file response when AI engine is not available
     */
    getMockFileResponse(filePath, fileType, context = {}) {
        return {
            response: `I've processed the ${fileType} file you uploaded. Here's what I found: This appears to be a ${fileType} file that contains relevant information.`,
            file_analysis: {
                file_type: fileType,
                file_size: 'unknown',
                content_summary: 'File content analyzed successfully',
                key_points: ['Point 1', 'Point 2', 'Point 3']
            },
            model: 'mock-ai-engine',
            processing_time: Math.random() * 2000,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get mock model information when AI engine is not available
     */
    getMockModelInfo() {
        return {
            model_name: 'CareConnect Steward v5.0',
            model_version: '5.0.0',
            model_type: 'mock',
            capabilities: ['text_processing', 'file_analysis', 'suggestions'],
            status: 'available',
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Get bridge status
     */
    getStatus() {
        return {
            is_connected: this.isConnected,
            python_process_active: !!this.pythonProcess && !this.pythonProcess.killed,
            reconnect_attempts: this.reconnectAttempts,
            message_queue_length: this.messageQueue.length,
            active_callbacks: this.responseCallbacks.size
        };
    }

    /**
     * Shutdown the AI bridge
     */
    async shutdown() {
        try {
            logger.info('Shutting down AI Bridge...');
            
            if (this.pythonProcess) {
                // Send shutdown message
                try {
                    await this.sendMessage('shutdown', {});
                } catch (error) {
                    // Ignore errors during shutdown
                }

                // Kill process if still running
                if (!this.pythonProcess.killed) {
                    this.pythonProcess.kill('SIGTERM');
                    
                    // Force kill after 5 seconds if still running
                    setTimeout(() => {
                        if (!this.pythonProcess.killed) {
                            this.pythonProcess.kill('SIGKILL');
                        }
                    }, 5000);
                }
            }

            this.isConnected = false;
            this.responseCallbacks.clear();
            this.messageQueue = [];
            
            logger.info('AI Bridge shutdown complete');
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'AI Bridge', operation: 'shutdown' });
        }
    }
}

// Create singleton instance
const aiBridge = new AIBridge();

module.exports = aiBridge;
