const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Default configuration
const defaultConfig = {
    // Application info
    name: 'CareConnect v5.0',
    version: '5.0.0',
    codename: 'The Steward',
    description: 'Autonomous AI Companion for Holistic Well-being',
    
    // Environment
    env: process.env.NODE_ENV || 'development',
    
    // Server configuration
    server: {
        host: process.env.HOST || 'localhost',
        port: parseInt(process.env.PORT) || 3001,
        timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000,
        maxPayload: process.env.MAX_PAYLOAD || '10mb'
    },
    
    // Database configuration
    database: {
        type: process.env.DB_TYPE || 'sqlite',
        path: process.env.DB_PATH || path.join(__dirname, '../data/careconnect.db'),
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'careconnect',
        username: process.env.DB_USERNAME || '',
        password: process.env.DB_PASSWORD || '',
        pool: {
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            max: parseInt(process.env.DB_POOL_MAX) || 10
        }
    },
    
    // AI Engine configuration
    ai: {
        modelPath: process.env.AI_MODEL_PATH || path.join(__dirname, '../ai/models/steward-v5.pt'),
        maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 2048,
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
        topP: parseFloat(process.env.AI_TOP_P) || 0.9,
        maxConcurrent: parseInt(process.env.AI_MAX_CONCURRENT) || 5,
        timeout: parseInt(process.env.AI_TIMEOUT) || 30000,
        enableEvolution: process.env.AI_ENABLE_EVOLUTION === 'true',
        evolutionInterval: parseInt(process.env.AI_EVOLUTION_INTERVAL) || 86400000 // 24 hours
    },
    
    // Security configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'careconnect-super-secret-key-change-in-production',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 1800000, // 30 minutes
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
        lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 900000, // 15 minutes
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
        enableCSP: process.env.ENABLE_CSP !== 'false',
        enableHSTS: process.env.ENABLE_HSTS === 'true'
    },
    
    // File storage configuration
    storage: {
        uploadPath: process.env.UPLOAD_PATH || path.join(__dirname, '../uploads'),
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
        allowedTypes: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'text/plain', 'text/csv', 'application/json',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        backupPath: process.env.BACKUP_PATH || path.join(__dirname, '../backups'),
        backupRetention: parseInt(process.env.BACKUP_RETENTION) || 30 // days
    },
    
    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        path: process.env.LOG_PATH || path.join(__dirname, '../logs'),
        maxSize: process.env.LOG_MAX_SIZE || '10m',
        maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
        enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
        enableFile: process.env.LOG_ENABLE_FILE !== 'false',
        format: process.env.LOG_FORMAT || 'combined'
    },
    
    // Telemetry configuration
    telemetry: {
        enabled: process.env.TELEMETRY_ENABLED === 'true',
        path: process.env.TELEMETRY_PATH || path.join(__dirname, '../data/telemetry.json'),
        maxEntries: parseInt(process.env.TELEMETRY_MAX_ENTRIES) || 10000,
        retentionDays: parseInt(process.env.TELEMETRY_RETENTION_DAYS) || 90,
        enablePerformance: process.env.TELEMETRY_PERFORMANCE === 'true',
        enableErrors: process.env.TELEMETRY_ERRORS !== 'false',
        enableUserActivity: process.env.TELEMETRY_USER_ACTIVITY === 'true'
    },
    
    // Orchestration configuration
    orchestration: {
        enabled: process.env.ORCHESTRATION_ENABLED !== 'false',
        configPath: process.env.ORCHESTRATION_CONFIG_PATH || path.join(__dirname, '../orchestration/config'),
        autoUpdate: process.env.ORCHESTRATION_AUTO_UPDATE === 'true',
        updateInterval: parseInt(process.env.ORCHESTRATION_UPDATE_INTERVAL) || 3600000, // 1 hour
        maxConnectors: parseInt(process.env.ORCHESTRATION_MAX_CONNECTORS) || 50,
        enableSelfEvolution: process.env.ORCHESTRATION_SELF_EVOLUTION === 'true'
    },
    
    // Feature flags
    features: {
        ai: process.env.FEATURE_AI !== 'false',
        health: process.env.FEATURE_HEALTH !== 'false',
        creativity: process.env.FEATURE_CREATIVITY !== 'false',
        finance: process.env.FEATURE_FINANCE !== 'false',
        community: process.env.FEATURE_COMMUNITY !== 'false',
        connectors: process.env.FEATURE_CONNECTORS !== 'false',
        telemetry: process.env.FEATURE_TELEMETRY !== 'false',
        selfMonitoring: process.env.FEATURE_SELF_MONITORING !== 'false',
        pwa: process.env.FEATURE_PWA !== 'false',
        offline: process.env.FEATURE_OFFLINE !== 'false'
    },
    
    // Performance configuration
    performance: {
        enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
        enableCaching: process.env.ENABLE_CACHING !== 'false',
        cacheMaxAge: parseInt(process.env.CACHE_MAX_AGE) || 86400, // 24 hours
        enableGzip: process.env.ENABLE_GZIP !== 'false',
        maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE) || 2048, // MB
        enableProfiling: process.env.ENABLE_PROFILING === 'true'
    },
    
    // Development configuration
    development: {
        enableHotReload: process.env.ENABLE_HOT_RELOAD === 'true',
        enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true',
        enableTestMode: process.env.ENABLE_TEST_MODE === 'true',
        mockAI: process.env.MOCK_AI === 'true',
        mockDatabase: process.env.MOCK_DATABASE === 'true',
        enableVerboseLogging: process.env.ENABLE_VERBOSE_LOGGING === 'true'
    }
};

// Validate configuration
function validateConfig(config) {
    const errors = [];
    
    // Validate server configuration
    if (config.server.port < 1 || config.server.port > 65535) {
        errors.push('Invalid server port number');
    }
    
    // Validate AI configuration
    if (config.ai.temperature < 0 || config.ai.temperature > 2) {
        errors.push('AI temperature must be between 0 and 2');
    }
    
    if (config.ai.topP < 0 || config.ai.topP > 1) {
        errors.push('AI top_p must be between 0 and 1');
    }
    
    // Validate security configuration
    if (config.security.jwtSecret === 'careconnect-super-secret-key-change-in-production' && config.env === 'production') {
        errors.push('JWT secret must be changed in production');
    }
    
    // Validate file paths
    const pathsToCheck = [
        config.database.path,
        config.storage.uploadPath,
        config.storage.backupPath,
        config.logging.path,
        config.telemetry.path
    ];
    
    pathsToCheck.forEach(path => {
        if (path && !fs.existsSync(path)) {
            try {
                fs.mkdirSync(path, { recursive: true });
            } catch (error) {
                errors.push(`Cannot create directory: ${path}`);
            }
        }
    });
    
    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
}

// Environment-specific overrides
function getEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
        case 'production':
            return {
                logging: {
                    level: 'warn',
                    enableConsole: false,
                    enableFile: true
                },
                security: {
                    enableCSP: true,
                    enableHSTS: true
                },
                performance: {
                    enableCompression: true,
                    enableCaching: true
                },
                development: {
                    enableHotReload: false,
                    enableDebugMode: false,
                    enableTestMode: false,
                    mockAI: false,
                    mockDatabase: false,
                    enableVerboseLogging: false
                }
            };
            
        case 'test':
            return {
                database: {
                    type: 'sqlite',
                    path: ':memory:'
                },
                ai: {
                    mockAI: true
                },
                logging: {
                    level: 'error',
                    enableConsole: false,
                    enableFile: false
                },
                telemetry: {
                    enabled: false
                }
            };
            
        case 'development':
        default:
            return {
                logging: {
                    level: 'debug',
                    enableConsole: true,
                    enableFile: true
                },
                development: {
                    enableHotReload: true,
                    enableDebugMode: true,
                    enableVerboseLogging: true
                }
            };
    }
}

// Merge configurations
function mergeConfig(baseConfig, envConfig) {
    const merged = JSON.parse(JSON.stringify(baseConfig));
    
    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = target[key] || {};
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    
    deepMerge(merged, envConfig);
    return merged;
}

// Load and validate configuration
let config;

try {
    const envConfig = getEnvironmentConfig();
    config = mergeConfig(defaultConfig, envConfig);
    validateConfig(config);
} catch (error) {
    console.error('Configuration error:', error.message);
    process.exit(1);
}

// Export configuration
module.exports = config;

// Export helper functions
module.exports.validateConfig = validateConfig;
module.exports.getEnvironmentConfig = getEnvironmentConfig;
module.exports.mergeConfig = mergeConfig;
