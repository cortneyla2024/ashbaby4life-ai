/**
 * Integration Bridge for CareConnect v5.0
 * Connects frontend to AI engine and handles communication between all components
 */

import { EventEmitter } from 'events';

class CareConnectBridge extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            aiEngineUrl: config.aiEngineUrl || 'http://localhost:5001',
            backendUrl: config.backendUrl || 'http://localhost:3001',
            videoProcessorUrl: config.videoProcessorUrl || 'http://localhost:5002',
            audioProcessorUrl: config.audioProcessorUrl || 'http://localhost:5003',
            avatarSystemUrl: config.avatarSystemUrl || 'http://localhost:5004',
            reconnectInterval: config.reconnectInterval || 5000,
            maxReconnectAttempts: config.maxReconnectAttempts || 10,
            timeout: config.timeout || 30000,
            ...config
        };
        
        // Connection state
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        
        // Service connections
        this.aiEngine = null;
        this.backend = null;
        this.videoProcessor = null;
        this.audioProcessor = null;
        this.avatarSystem = null;
        
        // Session management
        this.currentSession = null;
        this.userId = null;
        this.sessionId = null;
        
        // Data buffers
        this.videoBuffer = [];
        this.audioBuffer = [];
        this.messageBuffer = [];
        
        // Initialize connections
        this.initializeConnections();
    }
    
    async initializeConnections() {
        try {
            console.log('Initializing CareConnect Bridge...');
            
            // Initialize AI Engine connection
            await this.connectAIEngine();
            
            // Initialize Backend connection
            await this.connectBackend();
            
            // Initialize Video Processor connection
            await this.connectVideoProcessor();
            
            // Initialize Audio Processor connection
            await this.connectAudioProcessor();
            
            // Initialize Avatar System connection
            await this.connectAvatarSystem();
            
            this.isConnected = true;
            this.emit('connected');
            
            console.log('CareConnect Bridge initialized successfully');
            
        } catch (error) {
            console.error('Error initializing bridge:', error);
            this.emit('error', error);
            this.scheduleReconnect();
        }
    }
    
    async connectAIEngine() {
        try {
            const response = await fetch(`${this.config.aiEngineUrl}/health`, {
                method: 'GET',
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                this.aiEngine = {
                    url: this.config.aiEngineUrl,
                    status: 'connected'
                };
                console.log('AI Engine connected');
            } else {
                throw new Error(`AI Engine health check failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error connecting to AI Engine:', error);
            throw error;
        }
    }
    
    async connectBackend() {
        try {
            const response = await fetch(`${this.config.backendUrl}/health`, {
                method: 'GET',
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                this.backend = {
                    url: this.config.backendUrl,
                    status: 'connected'
                };
                console.log('Backend connected');
            } else {
                throw new Error(`Backend health check failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error connecting to Backend:', error);
            throw error;
        }
    }
    
    async connectVideoProcessor() {
        try {
            const response = await fetch(`${this.config.videoProcessorUrl}/health`, {
                method: 'GET',
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                this.videoProcessor = {
                    url: this.config.videoProcessorUrl,
                    status: 'connected'
                };
                console.log('Video Processor connected');
            } else {
                throw new Error(`Video Processor health check failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error connecting to Video Processor:', error);
            throw error;
        }
    }
    
    async connectAudioProcessor() {
        try {
            const response = await fetch(`${this.config.audioProcessorUrl}/health`, {
                method: 'GET',
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                this.audioProcessor = {
                    url: this.config.audioProcessorUrl,
                    status: 'connected'
                };
                console.log('Audio Processor connected');
            } else {
                throw new Error(`Audio Processor health check failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error connecting to Audio Processor:', error);
            throw error;
        }
    }
    
    async connectAvatarSystem() {
        try {
            const response = await fetch(`${this.config.avatarSystemUrl}/health`, {
                method: 'GET',
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                this.avatarSystem = {
                    url: this.config.avatarSystemUrl,
                    status: 'connected'
                };
                console.log('Avatar System connected');
            } else {
                throw new Error(`Avatar System health check failed: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error connecting to Avatar System:', error);
            throw error;
        }
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
        
        this.reconnectTimer = setTimeout(() => {
            this.initializeConnections();
        }, this.config.reconnectInterval);
    }
    
    async createSession(userId, sessionConfig = {}) {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            const response = await fetch(`${this.config.backendUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    config: sessionConfig
                }),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const sessionData = await response.json();
                this.currentSession = sessionData;
                this.userId = userId;
                this.sessionId = sessionData.sessionId;
                
                this.emit('sessionCreated', sessionData);
                return sessionData;
            } else {
                throw new Error(`Failed to create session: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error creating session:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async sendToAI(message, context = {}) {
        try {
            if (!this.isConnected || !this.sessionId) {
                throw new Error('Bridge not connected or no active session');
            }
            
            const requestData = {
                sessionId: this.sessionId,
                userId: this.userId,
                message,
                context: {
                    timestamp: Date.now(),
                    videoData: this.videoBuffer.slice(-10), // Last 10 video frames
                    audioData: this.audioBuffer.slice(-50), // Last 50 audio frames
                    ...context
                }
            };
            
            const response = await fetch(`${this.config.aiEngineUrl}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const aiResponse = await response.json();
                this.emit('aiResponse', aiResponse);
                return aiResponse;
            } else {
                throw new Error(`AI Engine error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error sending to AI:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async processVideo(videoData) {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            // Add to buffer
            this.videoBuffer.push({
                data: videoData,
                timestamp: Date.now()
            });
            
            // Keep buffer size manageable
            if (this.videoBuffer.length > 100) {
                this.videoBuffer = this.videoBuffer.slice(-50);
            }
            
            // Send to video processor
            const response = await fetch(`${this.config.videoProcessorUrl}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    videoData,
                    timestamp: Date.now()
                }),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const processedData = await response.json();
                this.emit('videoProcessed', processedData);
                return processedData;
            } else {
                throw new Error(`Video processing error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error processing video:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async processAudio(audioData) {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            // Add to buffer
            this.audioBuffer.push({
                data: audioData,
                timestamp: Date.now()
            });
            
            // Keep buffer size manageable
            if (this.audioBuffer.length > 1000) {
                this.audioBuffer = this.audioBuffer.slice(-500);
            }
            
            // Send to audio processor
            const response = await fetch(`${this.config.audioProcessorUrl}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    audioData,
                    timestamp: Date.now()
                }),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const processedData = await response.json();
                this.emit('audioProcessed', processedData);
                return processedData;
            } else {
                throw new Error(`Audio processing error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error processing audio:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async generateAvatar(avatarConfig) {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            const response = await fetch(`${this.config.avatarSystemUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    config: avatarConfig
                }),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const avatarData = await response.json();
                this.emit('avatarGenerated', avatarData);
                return avatarData;
            } else {
                throw new Error(`Avatar generation error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error generating avatar:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async updateAvatarExpression(emotion, intensity = 1.0) {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            const response = await fetch(`${this.config.avatarSystemUrl}/expression`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    emotion,
                    intensity,
                    timestamp: Date.now()
                }),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const result = await response.json();
                this.emit('avatarExpressionUpdated', result);
                return result;
            } else {
                throw new Error(`Avatar expression update error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error updating avatar expression:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async performAvatarGesture(gestureType, duration = 2.0) {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            const response = await fetch(`${this.config.avatarSystemUrl}/gesture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    gestureType,
                    duration,
                    timestamp: Date.now()
                }),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const result = await response.json();
                this.emit('avatarGesturePerformed', result);
                return result;
            } else {
                throw new Error(`Avatar gesture error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error performing avatar gesture:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async synthesizeSpeech(text, voiceProfile = null) {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            const response = await fetch(`${this.config.audioProcessorUrl}/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    text,
                    voiceProfile,
                    timestamp: Date.now()
                }),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const audioData = await response.json();
                this.emit('speechSynthesized', audioData);
                return audioData;
            } else {
                throw new Error(`Speech synthesis error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error synthesizing speech:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async recognizeSpeech(audioData) {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            const response = await fetch(`${this.config.audioProcessorUrl}/recognize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    audioData,
                    timestamp: Date.now()
                }),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const result = await response.json();
                this.emit('speechRecognized', result);
                return result;
            } else {
                throw new Error(`Speech recognition error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error recognizing speech:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async getAnalytics() {
        try {
            if (!this.isConnected) {
                throw new Error('Bridge not connected');
            }
            
            const response = await fetch(`${this.config.backendUrl}/analytics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const analytics = await response.json();
                this.emit('analyticsReceived', analytics);
                return analytics;
            } else {
                throw new Error(`Analytics error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error getting analytics:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async saveSession() {
        try {
            if (!this.isConnected || !this.sessionId) {
                throw new Error('Bridge not connected or no active session');
            }
            
            const sessionData = {
                sessionId: this.sessionId,
                userId: this.userId,
                timestamp: Date.now(),
                videoBuffer: this.videoBuffer,
                audioBuffer: this.audioBuffer,
                messageBuffer: this.messageBuffer
            };
            
            const response = await fetch(`${this.config.backendUrl}/sessions/${this.sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData),
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                const result = await response.json();
                this.emit('sessionSaved', result);
                return result;
            } else {
                throw new Error(`Session save error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error saving session:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    async endSession() {
        try {
            if (!this.isConnected || !this.sessionId) {
                throw new Error('Bridge not connected or no active session');
            }
            
            // Save session before ending
            await this.saveSession();
            
            const response = await fetch(`${this.config.backendUrl}/sessions/${this.sessionId}`, {
                method: 'DELETE',
                timeout: this.config.timeout
            });
            
            if (response.ok) {
                this.currentSession = null;
                this.sessionId = null;
                this.userId = null;
                
                // Clear buffers
                this.videoBuffer = [];
                this.audioBuffer = [];
                this.messageBuffer = [];
                
                this.emit('sessionEnded');
            } else {
                throw new Error(`Session end error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error ending session:', error);
            this.emit('error', error);
            throw error;
        }
    }
    
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            services: {
                aiEngine: this.aiEngine?.status || 'disconnected',
                backend: this.backend?.status || 'disconnected',
                videoProcessor: this.videoProcessor?.status || 'disconnected',
                audioProcessor: this.audioProcessor?.status || 'disconnected',
                avatarSystem: this.avatarSystem?.status || 'disconnected'
            },
            session: {
                hasSession: !!this.sessionId,
                sessionId: this.sessionId,
                userId: this.userId
            }
        };
    }
    
    disconnect() {
        try {
            this.isConnected = false;
            
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            
            // End session if active
            if (this.sessionId) {
                this.endSession().catch(console.error);
            }
            
            this.emit('disconnected');
            console.log('CareConnect Bridge disconnected');
            
        } catch (error) {
            console.error('Error disconnecting bridge:', error);
        }
    }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareConnectBridge;
} else if (typeof window !== 'undefined') {
    window.CareConnectBridge = CareConnectBridge;
}

export default CareConnectBridge;
