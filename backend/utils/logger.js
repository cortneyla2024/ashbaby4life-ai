const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Ensure log directory exists
const logDir = path.dirname(config.logging.path);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (stack) {
            log += `\n${stack}`;
        }
        
        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
    })
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (stack) {
            log += `\n${stack}`;
        }
        
        if (Object.keys(meta).length > 0) {
            log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
    })
);

// Create transports array
const transports = [];

// Console transport
if (config.logging.enableConsole) {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
            level: config.logging.level
        })
    );
}

// File transport
if (config.logging.enableFile) {
    // Main log file
    transports.push(
        new winston.transports.File({
            filename: path.join(config.logging.path, 'careconnect.log'),
            format: logFormat,
            level: config.logging.level,
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            tailable: true
        })
    );

    // Error log file
    transports.push(
        new winston.transports.File({
            filename: path.join(config.logging.path, 'error.log'),
            format: logFormat,
            level: 'error',
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            tailable: true
        })
    );

    // Combined log file
    transports.push(
        new winston.transports.File({
            filename: path.join(config.logging.path, 'combined.log'),
            format: logFormat,
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles,
            tailable: true
        })
    );
}

// Create logger instance
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports,
    exitOnError: false
});

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.id || 'anonymous'
        };

        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    });

    next();
};

// Add performance logging
logger.performance = (operation, duration, metadata = {}) => {
    logger.info('Performance', {
        operation,
        duration: `${duration}ms`,
        ...metadata
    });
};

// Add security logging
logger.security = (event, details = {}) => {
    logger.warn('Security Event', {
        event,
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Add AI logging
logger.ai = (operation, details = {}) => {
    logger.info('AI Operation', {
        operation,
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Add telemetry logging
logger.telemetry = (event, data = {}) => {
    logger.debug('Telemetry', {
        event,
        timestamp: new Date().toISOString(),
        ...data
    });
};

// Add database logging
logger.database = (operation, details = {}) => {
    logger.debug('Database', {
        operation,
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Add orchestration logging
logger.orchestration = (operation, details = {}) => {
    logger.info('Orchestration', {
        operation,
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Add error logging with context
logger.errorWithContext = (error, context = {}) => {
    logger.error('Application Error', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        context,
        timestamp: new Date().toISOString()
    });
};

// Add startup logging
logger.startup = (component, details = {}) => {
    logger.info('Startup', {
        component,
        status: 'initialized',
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Add shutdown logging
logger.shutdown = (component, details = {}) => {
    logger.info('Shutdown', {
        component,
        status: 'shutdown',
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Add health check logging
logger.health = (component, status, details = {}) => {
    const level = status === 'healthy' ? 'info' : 'warn';
    logger[level]('Health Check', {
        component,
        status,
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Add user activity logging
logger.userActivity = (userId, action, details = {}) => {
    logger.info('User Activity', {
        userId,
        action,
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Add system metrics logging
logger.metrics = (metrics) => {
    logger.debug('System Metrics', {
        ...metrics,
        timestamp: new Date().toISOString()
    });
};

// Add audit logging
logger.audit = (action, userId, details = {}) => {
    logger.info('Audit', {
        action,
        userId,
        timestamp: new Date().toISOString(),
        ...details
    });
};

// Handle uncaught exceptions
logger.exceptions.handle(
    new winston.transports.File({
        filename: path.join(config.logging.path, 'exceptions.log'),
        format: logFormat
    })
);

// Handle unhandled promise rejections
logger.rejections.handle(
    new winston.transports.File({
        filename: path.join(config.logging.path, 'rejections.log'),
        format: logFormat
    })
);

// Export logger instance
module.exports = logger;
