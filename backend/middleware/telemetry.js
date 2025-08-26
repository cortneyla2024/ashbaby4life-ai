const config = require('../config/config');
const logger = require('../utils/logger');

class TelemetryMiddleware {
    constructor() {
        this.setupTelemetryMiddleware = this.setupTelemetryMiddleware.bind(this);
        this.telemetryData = [];
        this.maxEntries = config.telemetry.maxEntries || 10000;
    }

    setupTelemetryMiddleware(app) {
        // Request tracking middleware
        app.use(this.trackRequest.bind(this));

        // Performance monitoring middleware
        app.use(this.monitorPerformance.bind(this));

        // Error tracking middleware
        app.use(this.trackErrors.bind(this));

        // User activity tracking middleware
        app.use(this.trackUserActivity.bind(this));

        logger.startup('Telemetry Middleware');
    }

    // Track all requests
    trackRequest(req, res, next) {
        if (!config.telemetry.enabled) {
            return next();
        }

        const startTime = Date.now();
        const requestId = this.generateRequestId();

        // Add request ID to response headers
        res.setHeader('X-Request-ID', requestId);

        // Track request start
        const requestData = {
            id: requestId,
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            path: req.path,
            query: req.query,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || null,
            sessionId: req.session?.id || null,
            startTime: startTime,
            endTime: null,
            duration: null,
            statusCode: null,
            responseSize: null,
            error: null
        };

        // Store request data
        this.storeTelemetryData('request', requestData);

        // Track response
        const originalSend = res.send;
        res.send = function(data) {
            const endTime = Date.now();
            const duration = endTime - startTime;

            requestData.endTime = endTime;
            requestData.duration = duration;
            requestData.statusCode = res.statusCode;
            requestData.responseSize = data ? data.length : 0;

            // Update telemetry data
            this.updateTelemetryData('request', requestData.id, requestData);

            // Log request completion
            logger.telemetry('request_completed', {
                id: requestId,
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration: duration,
                userId: req.user?.id
            });

            return originalSend.call(this, data);
        }.bind(this);

        // Track errors
        res.on('error', (error) => {
            requestData.error = {
                message: error.message,
                stack: error.stack,
                name: error.name
            };
            this.updateTelemetryData('request', requestData.id, requestData);
        });

        next();
    }

    // Monitor performance
    monitorPerformance(req, res, next) {
        if (!config.telemetry.enabled || !config.telemetry.enablePerformance) {
            return next();
        }

        const startTime = process.hrtime.bigint();

        // Monitor memory usage
        const initialMemory = process.memoryUsage();

        res.on('finish', () => {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
            const finalMemory = process.memoryUsage();

            const performanceData = {
                timestamp: new Date().toISOString(),
                requestId: res.getHeader('X-Request-ID'),
                method: req.method,
                url: req.originalUrl,
                duration: duration,
                memoryDelta: {
                    rss: finalMemory.rss - initialMemory.rss,
                    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
                    heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
                    external: finalMemory.external - initialMemory.external
                },
                finalMemory: finalMemory,
                statusCode: res.statusCode
            };

            this.storeTelemetryData('performance', performanceData);

            // Log performance metrics
            logger.performance('request_performance', duration, {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                memoryDelta: performanceData.memoryDelta
            });
        });

        next();
    }

    // Track errors
    trackErrors(error, req, res, next) {
        if (!config.telemetry.enabled || !config.telemetry.enableErrors) {
            return next(error);
        }

        const errorData = {
            timestamp: new Date().toISOString(),
            requestId: res.getHeader('X-Request-ID'),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.id || null,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            context: {
                body: req.body,
                query: req.query,
                params: req.params,
                headers: this.sanitizeHeaders(req.headers)
            }
        };

        this.storeTelemetryData('error', errorData);

        // Log error
        logger.telemetry('error_occurred', {
            requestId: errorData.requestId,
            method: req.method,
            url: req.originalUrl,
            error: error.name,
            message: error.message,
            userId: req.user?.id
        });

        next(error);
    }

    // Track user activity
    trackUserActivity(req, res, next) {
        if (!config.telemetry.enabled || !config.telemetry.enableUserActivity) {
            return next();
        }

        // Only track authenticated users
        if (!req.user) {
            return next();
        }

        const activityData = {
            timestamp: new Date().toISOString(),
            userId: req.user.id,
            username: req.user.username,
            method: req.method,
            url: req.originalUrl,
            path: req.path,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            sessionId: req.session?.id || null
        };

        // Categorize activity
        if (req.path.startsWith('/api/ai')) {
            activityData.category = 'ai_interaction';
        } else if (req.path.startsWith('/api/health')) {
            activityData.category = 'health_module';
        } else if (req.path.startsWith('/api/creativity')) {
            activityData.category = 'creativity_module';
        } else if (req.path.startsWith('/api/finance')) {
            activityData.category = 'finance_module';
        } else if (req.path.startsWith('/api/community')) {
            activityData.category = 'community_module';
        } else if (req.path.startsWith('/api/settings')) {
            activityData.category = 'settings';
        } else {
            activityData.category = 'general';
        }

        this.storeTelemetryData('user_activity', activityData);

        next();
    }

    // Store telemetry data
    storeTelemetryData(type, data) {
        const entry = {
            type,
            data,
            timestamp: new Date().toISOString()
        };

        this.telemetryData.push(entry);

        // Maintain max entries limit
        if (this.telemetryData.length > this.maxEntries) {
            this.telemetryData = this.telemetryData.slice(-this.maxEntries);
        }

        // Clean up old entries
        this.cleanupOldEntries();
    }

    // Update existing telemetry data
    updateTelemetryData(type, id, updatedData) {
        const index = this.telemetryData.findIndex(entry => 
            entry.type === type && entry.data.id === id
        );

        if (index !== -1) {
            this.telemetryData[index].data = { ...this.telemetryData[index].data, ...updatedData };
        }
    }

    // Clean up old entries
    cleanupOldEntries() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - config.telemetry.retentionDays);

        this.telemetryData = this.telemetryData.filter(entry => 
            new Date(entry.timestamp) > cutoffDate
        );
    }

    // Generate unique request ID
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Sanitize headers for logging
    sanitizeHeaders(headers) {
        const sanitized = {};
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

        for (const [key, value] of Object.entries(headers)) {
            if (sensitiveHeaders.includes(key.toLowerCase())) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    // Get telemetry data
    getTelemetryData(type = null, limit = 100) {
        let data = this.telemetryData;

        if (type) {
            data = data.filter(entry => entry.type === type);
        }

        return data.slice(-limit);
    }

    // Get telemetry statistics
    getTelemetryStats() {
        const stats = {
            total_entries: this.telemetryData.length,
            by_type: {},
            recent_activity: {
                requests: 0,
                errors: 0,
                user_activity: 0
            },
            performance: {
                avg_response_time: 0,
                total_requests: 0
            }
        };

        // Count by type
        this.telemetryData.forEach(entry => {
            stats.by_type[entry.type] = (stats.by_type[entry.type] || 0) + 1;
        });

        // Calculate recent activity (last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentEntries = this.telemetryData.filter(entry => 
            new Date(entry.timestamp) > oneHourAgo
        );

        recentEntries.forEach(entry => {
            if (entry.type === 'request') {
                stats.recent_activity.requests++;
                if (entry.data.duration) {
                    stats.performance.total_requests++;
                    stats.performance.avg_response_time += entry.data.duration;
                }
            } else if (entry.type === 'error') {
                stats.recent_activity.errors++;
            } else if (entry.type === 'user_activity') {
                stats.recent_activity.user_activity++;
            }
        });

        if (stats.performance.total_requests > 0) {
            stats.performance.avg_response_time /= stats.performance.total_requests;
        }

        return stats;
    }

    // Export telemetry data
    exportTelemetryData(format = 'json') {
        const data = {
            export_date: new Date().toISOString(),
            total_entries: this.telemetryData.length,
            data: this.telemetryData
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(data);
        }

        return data;
    }

    // Convert to CSV format
    convertToCSV(data) {
        const headers = ['timestamp', 'type', 'method', 'url', 'status_code', 'duration', 'user_id', 'ip'];
        const rows = [headers.join(',')];

        data.data.forEach(entry => {
            const row = [
                entry.timestamp,
                entry.type,
                entry.data.method || '',
                entry.data.url || '',
                entry.data.statusCode || '',
                entry.data.duration || '',
                entry.data.userId || '',
                entry.data.ip || ''
            ];
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    // Clear telemetry data
    clearTelemetryData() {
        this.telemetryData = [];
        logger.info('Telemetry data cleared');
    }

    // Get system metrics
    getSystemMetrics() {
        const metrics = {
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime(),
            node_version: process.version,
            platform: process.platform,
            arch: process.arch
        };

        this.storeTelemetryData('system_metrics', metrics);
        return metrics;
    }
}

// Create and export telemetry middleware instance
const telemetryMiddleware = new TelemetryMiddleware();

// Export setup function
function setupTelemetryMiddleware(app) {
    telemetryMiddleware.setupTelemetryMiddleware(app);
}

// Periodic system metrics collection
if (config.telemetry.enabled) {
    setInterval(() => {
        telemetryMiddleware.getSystemMetrics();
    }, 60000); // Every minute
}

// Periodic cleanup
setInterval(() => {
    telemetryMiddleware.cleanupOldEntries();
}, 300000); // Every 5 minutes

module.exports = {
    telemetryMiddleware,
    setupTelemetryMiddleware,
    TelemetryMiddleware
};
