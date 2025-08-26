const logger = require('../utils/logger');

class ErrorHandler {
    constructor() {
        this.setupErrorHandling = this.setupErrorHandling.bind(this);
    }

    setupErrorHandling(app) {
        // 404 handler for API routes
        app.use('/api/*', (req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `API endpoint ${req.originalUrl} not found`,
                code: 'ENDPOINT_NOT_FOUND',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        });

        // Global error handler
        app.use((error, req, res, next) => {
            this.handleError(error, req, res);
        });

        logger.startup('Error Handler');
    }

    handleError(error, req, res) {
        // Log the error
        logger.errorWithContext(error, {
            component: 'Error Handler',
            operation: 'handleError',
            url: req.originalUrl,
            method: req.method,
            user_id: req.user?.id,
            ip: req.ip || req.connection.remoteAddress
        });

        // Determine error type and create appropriate response
        let statusCode = 500;
        let errorResponse = {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
            code: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
        };

        // Handle different types of errors
        if (error.name === 'ValidationError') {
            statusCode = 400;
            errorResponse = {
                error: 'Bad Request',
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: error.details || error.message,
                timestamp: new Date().toISOString()
            };
        } else if (error.name === 'UnauthorizedError') {
            statusCode = 401;
            errorResponse = {
                error: 'Unauthorized',
                message: 'Authentication required',
                code: 'UNAUTHORIZED',
                timestamp: new Date().toISOString()
            };
        } else if (error.name === 'ForbiddenError') {
            statusCode = 403;
            errorResponse = {
                error: 'Forbidden',
                message: 'Access denied',
                code: 'FORBIDDEN',
                timestamp: new Date().toISOString()
            };
        } else if (error.name === 'NotFoundError') {
            statusCode = 404;
            errorResponse = {
                error: 'Not Found',
                message: error.message || 'Resource not found',
                code: 'NOT_FOUND',
                timestamp: new Date().toISOString()
            };
        } else if (error.name === 'ConflictError') {
            statusCode = 409;
            errorResponse = {
                error: 'Conflict',
                message: error.message || 'Resource conflict',
                code: 'CONFLICT',
                timestamp: new Date().toISOString()
            };
        } else if (error.name === 'RateLimitError') {
            statusCode = 429;
            errorResponse = {
                error: 'Too Many Requests',
                message: 'Rate limit exceeded',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: error.retryAfter,
                timestamp: new Date().toISOString()
            };
        } else if (error.code === 'SQLITE_CONSTRAINT') {
            statusCode = 400;
            errorResponse = {
                error: 'Bad Request',
                message: 'Database constraint violation',
                code: 'CONSTRAINT_VIOLATION',
                details: error.message,
                timestamp: new Date().toISOString()
            };
        } else if (error.code === 'SQLITE_BUSY') {
            statusCode = 503;
            errorResponse = {
                error: 'Service Unavailable',
                message: 'Database is busy, please try again',
                code: 'DATABASE_BUSY',
                timestamp: new Date().toISOString()
            };
        } else if (error.code === 'ENOENT') {
            statusCode = 404;
            errorResponse = {
                error: 'Not Found',
                message: 'File or resource not found',
                code: 'FILE_NOT_FOUND',
                timestamp: new Date().toISOString()
            };
        } else if (error.code === 'EACCES') {
            statusCode = 403;
            errorResponse = {
                error: 'Forbidden',
                message: 'Permission denied',
                code: 'PERMISSION_DENIED',
                timestamp: new Date().toISOString()
            };
        } else if (error.code === 'ENOSPC') {
            statusCode = 507;
            errorResponse = {
                error: 'Insufficient Storage',
                message: 'Storage space exhausted',
                code: 'STORAGE_FULL',
                timestamp: new Date().toISOString()
            };
        }

        // Add request information in development
        if (process.env.NODE_ENV === 'development') {
            errorResponse.debug = {
                stack: error.stack,
                url: req.originalUrl,
                method: req.method,
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers
            };
        }

        // Send error response
        res.status(statusCode).json(errorResponse);
    }

    // Custom error classes
    static ValidationError(message, details = null) {
        const error = new Error(message);
        error.name = 'ValidationError';
        error.details = details;
        return error;
    }

    static UnauthorizedError(message = 'Authentication required') {
        const error = new Error(message);
        error.name = 'UnauthorizedError';
        return error;
    }

    static ForbiddenError(message = 'Access denied') {
        const error = new Error(message);
        error.name = 'ForbiddenError';
        return error;
    }

    static NotFoundError(message = 'Resource not found') {
        const error = new Error(message);
        error.name = 'NotFoundError';
        return error;
    }

    static ConflictError(message = 'Resource conflict') {
        const error = new Error(message);
        error.name = 'ConflictError';
        return error;
    }

    static RateLimitError(message = 'Rate limit exceeded', retryAfter = null) {
        const error = new Error(message);
        error.name = 'RateLimitError';
        error.retryAfter = retryAfter;
        return error;
    }

    // Async error wrapper
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    // Error response helper
    static sendError(res, statusCode, message, code = null, details = null) {
        const errorResponse = {
            error: this.getErrorTitle(statusCode),
            message,
            code: code || this.getErrorCode(statusCode),
            timestamp: new Date().toISOString()
        };

        if (details) {
            errorResponse.details = details;
        }

        res.status(statusCode).json(errorResponse);
    }

    // Get error title based on status code
    static getErrorTitle(statusCode) {
        const titles = {
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            409: 'Conflict',
            422: 'Unprocessable Entity',
            429: 'Too Many Requests',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
            507: 'Insufficient Storage'
        };
        return titles[statusCode] || 'Error';
    }

    // Get error code based on status code
    static getErrorCode(statusCode) {
        const codes = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            429: 'RATE_LIMIT_EXCEEDED',
            500: 'INTERNAL_ERROR',
            502: 'BAD_GATEWAY',
            503: 'SERVICE_UNAVAILABLE',
            507: 'STORAGE_FULL'
        };
        return codes[statusCode] || 'UNKNOWN_ERROR';
    }

    // Handle uncaught exceptions
    static handleUncaughtException(error) {
        logger.errorWithContext(error, {
            component: 'Error Handler',
            operation: 'uncaughtException',
            type: 'uncaught'
        });

        // Graceful shutdown
        process.exit(1);
    }

    // Handle unhandled promise rejections
    static handleUnhandledRejection(reason, promise) {
        logger.errorWithContext(new Error(reason), {
            component: 'Error Handler',
            operation: 'unhandledRejection',
            type: 'unhandled',
            promise: promise.toString()
        });

        // Graceful shutdown
        process.exit(1);
    }

    // Setup global error handlers
    static setupGlobalHandlers() {
        process.on('uncaughtException', this.handleUncaughtException);
        process.on('unhandledRejection', this.handleUnhandledRejection);
    }
}

// Create and export error handler instance
const errorHandler = new ErrorHandler();

// Export setup function
function setupErrorHandling(app) {
    errorHandler.setupErrorHandling(app);
}

module.exports = {
    errorHandler,
    setupErrorHandling,
    ErrorHandler
};
