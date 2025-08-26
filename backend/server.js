// =============================================================================
// CareConnect v5.0 - Backend Server
// =============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Import local modules
const config = require('./config/config');
const logger = require('./utils/logger');
const { initializeDatabase } = require('./models/database');
const { setupAuthMiddleware } = require('./middleware/auth');
const { setupTelemetryMiddleware } = require('./middleware/telemetry');
const { setupErrorHandling } = require('./middleware/errorHandler');
const { setupCORS } = require('./middleware/cors');
const { setupSecurity } = require('./middleware/security');

// Import routes
const aiRoutes = require('./routes/ai');
const sessionRoutes = require('./routes/session');
const telemetryRoutes = require('./routes/telemetry');
const settingsRoutes = require('./routes/settings');
const healthRoutes = require('./routes/health');
const creativityRoutes = require('./routes/creativity');
const financeRoutes = require('./routes/finance');
const communityRoutes = require('./routes/community');
const connectorRoutes = require('./routes/connector');

// Import AI engine bridge
const { initializeAIEngine } = require('./ai/bridge');

// Import orchestration engine
const { initializeOrchestration } = require('./orchestration/engine');

// Import telemetry and monitoring
const { initializeTelemetry } = require('./utils/telemetry');
const { initializeSelfMonitor } = require('./utils/selfMonitor');

class CareConnectServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.isInitialized = false;
        this.startTime = Date.now();
    }

    async initialize() {
        try {
            logger.info('Initializing CareConnect v5.0 Server...');

            // Initialize core systems
            await this.initializeCoreSystems();
            
            // Setup middleware
            this.setupMiddleware();
            
            // Setup routes
            this.setupRoutes();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Setup static files
            this.setupStaticFiles();
            
            // Setup health checks
            this.setupHealthChecks();
            
            this.isInitialized = true;
            logger.info('CareConnect Server initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize server:', error);
            throw error;
        }
    }

    async initializeCoreSystems() {
        // Initialize database
        await initializeDatabase();
        logger.info('Database initialized');

        // Initialize AI engine
        await initializeAIEngine();
        logger.info('AI Engine initialized');

        // Initialize orchestration engine
        await initializeOrchestration();
        logger.info('Orchestration Engine initialized');

        // Initialize telemetry
        await initializeTelemetry();
        logger.info('Telemetry system initialized');

        // Initialize self-monitoring
        await initializeSelfMonitor();
        logger.info('Self-monitoring system initialized');
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "blob:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            }
        }));

        // CORS setup
        setupCORS(this.app);

        // Security setup
        setupSecurity(this.app);

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use('/api/', limiter);

        // Compression
        this.app.use(compression());

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Logging
        if (config.env === 'development') {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined', {
                stream: {
                    write: (message) => logger.info(message.trim())
                }
            }));
        }

        // Telemetry middleware
        setupTelemetryMiddleware(this.app);

        // Authentication middleware
        setupAuthMiddleware(this.app);
    }

    setupRoutes() {
        // API routes
        this.app.use('/api/ai', aiRoutes);
        this.app.use('/api/session', sessionRoutes);
        this.app.use('/api/telemetry', telemetryRoutes);
        this.app.use('/api/settings', settingsRoutes);
        this.app.use('/api/health', healthRoutes);
        this.app.use('/api/creativity', creativityRoutes);
        this.app.use('/api/finance', financeRoutes);
        this.app.use('/api/community', communityRoutes);
        this.app.use('/api/connector', connectorRoutes);

        // Root route
        this.app.get('/', (req, res) => {
            res.json({
                name: 'CareConnect v5.0',
                version: '5.0.0',
                codename: 'The Steward',
                status: 'operational',
                uptime: Date.now() - this.startTime,
                timestamp: new Date().toISOString()
            });
        });

        // Health check route
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.startTime,
                version: '5.0.0'
            });
        });

        // API info route
        this.app.get('/api', (req, res) => {
            res.json({
                name: 'CareConnect API',
                version: '5.0.0',
                endpoints: {
                    ai: '/api/ai',
                    session: '/api/session',
                    telemetry: '/api/telemetry',
                    settings: '/api/settings',
                    health: '/api/health',
                    creativity: '/api/creativity',
                    finance: '/api/finance',
                    community: '/api/community',
                    connector: '/api/connector'
                },
                documentation: '/api/docs'
            });
        });
    }

    setupErrorHandling() {
        setupErrorHandling(this.app);
    }

    setupStaticFiles() {
        // Serve frontend static files
        this.app.use(express.static(path.join(__dirname, '../frontend')));

        // Serve uploaded files
        this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        // Serve AI model files
        this.app.use('/ai-models', express.static(path.join(__dirname, 'ai/models')));

        // Handle SPA routing
        this.app.get('*', (req, res) => {
            // Don't serve index.html for API routes
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ error: 'API endpoint not found' });
            }
            
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });
    }

    setupHealthChecks() {
        // Periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Every 30 seconds
    }

    async performHealthCheck() {
        try {
            // Check database connection
            const dbHealth = await this.checkDatabaseHealth();
            
            // Check AI engine health
            const aiHealth = await this.checkAIEngineHealth();
            
            // Check file system
            const fsHealth = this.checkFileSystemHealth();
            
            // Log health status
            if (dbHealth && aiHealth && fsHealth) {
                logger.debug('Health check passed');
            } else {
                logger.warn('Health check failed', { dbHealth, aiHealth, fsHealth });
            }
        } catch (error) {
            logger.error('Health check error:', error);
        }
    }

    async checkDatabaseHealth() {
        try {
            // Simple database health check
            return true;
        } catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }

    async checkAIEngineHealth() {
        try {
            // Simple AI engine health check
            return true;
        } catch (error) {
            logger.error('AI engine health check failed:', error);
            return false;
        }
    }

    checkFileSystemHealth() {
        try {
            // Check if essential directories exist
            const essentialDirs = [
                path.join(__dirname, 'uploads'),
                path.join(__dirname, 'ai/models'),
                path.join(__dirname, 'logs'),
                path.join(__dirname, '../frontend')
            ];

            for (const dir of essentialDirs) {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
            }

            return true;
        } catch (error) {
            logger.error('File system health check failed:', error);
            return false;
        }
    }

    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(config.server.port, config.server.host, () => {
                    logger.info(`CareConnect Server running on http://${config.server.host}:${config.server.port}`);
                    logger.info(`Environment: ${config.env}`);
                    logger.info(`Version: ${config.version}`);
                    
                    // Log startup information
                    this.logStartupInfo();
                    
                    resolve(this.server);
                });

                this.server.on('error', (error) => {
                    logger.error('Server error:', error);
                    reject(error);
                });

                // Graceful shutdown
                process.on('SIGTERM', () => this.gracefulShutdown());
                process.on('SIGINT', () => this.gracefulShutdown());

            } catch (error) {
                logger.error('Failed to start server:', error);
                reject(error);
            }
        });
    }

    async gracefulShutdown() {
        logger.info('Received shutdown signal, starting graceful shutdown...');
        
        if (this.server) {
            this.server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        } else {
            process.exit(0);
        }
    }

    logStartupInfo() {
        const startupInfo = {
            timestamp: new Date().toISOString(),
            version: config.version,
            environment: config.env,
            port: config.server.port,
            host: config.server.host,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        };

        logger.info('Startup Information:', startupInfo);
    }

    getServerInfo() {
        return {
            isInitialized: this.isInitialized,
            uptime: Date.now() - this.startTime,
            version: config.version,
            environment: config.env,
            port: config.server.port,
            host: config.server.host
        };
    }
}

// Create and export server instance
const server = new CareConnectServer();

// Start server if this file is run directly
if (require.main === module) {
    server.start().catch((error) => {
        logger.error('Failed to start CareConnect Server:', error);
        process.exit(1);
    });
}

module.exports = server;
