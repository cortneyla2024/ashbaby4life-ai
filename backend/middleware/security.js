const config = require('../config/config');
const logger = require('../utils/logger');

class SecurityMiddleware {
    constructor() {
        this.setupSecurity = this.setupSecurity.bind(this);
    }

    setupSecurity(app) {
        // Security headers middleware
        app.use(this.securityHeaders.bind(this));

        // Request validation middleware
        app.use(this.validateRequest.bind(this));

        // IP filtering middleware
        app.use(this.ipFilter.bind(this));

        // Request sanitization middleware
        app.use(this.sanitizeRequest.bind(this));

        logger.startup('Security Middleware');
    }

    // Security headers middleware
    securityHeaders(req, res, next) {
        // Basic security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy
        if (config.security.enableCSP) {
            const cspDirectives = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob:",
                "font-src 'self'",
                "connect-src 'self'",
                "media-src 'self'",
                "object-src 'none'",
                "frame-src 'none'",
                "worker-src 'self'",
                "form-action 'self'",
                "base-uri 'self'",
                "manifest-src 'self'"
            ];

            res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
        }

        // HTTP Strict Transport Security
        if (config.security.enableHSTS) {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Permissions Policy
        res.setHeader('Permissions-Policy', [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()'
        ].join(', '));

        // Feature Policy (for older browsers)
        res.setHeader('Feature-Policy', [
            'camera none',
            'microphone none',
            'geolocation none',
            'payment none',
            'usb none',
            'magnetometer none',
            'gyroscope none',
            'accelerometer none'
        ].join('; '));

        next();
    }

    // Request validation middleware
    validateRequest(req, res, next) {
        // Validate request size
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSize = parseInt(config.server.maxPayload) || 10485760; // 10MB default

        if (contentLength > maxSize) {
            return res.status(413).json({
                error: 'Payload Too Large',
                message: 'Request body too large',
                code: 'PAYLOAD_TOO_LARGE',
                maxSize: maxSize
            });
        }

        // Validate content type for POST/PUT requests
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const contentType = req.headers['content-type'];
            
            if (!contentType || !contentType.includes('application/json')) {
                return res.status(415).json({
                    error: 'Unsupported Media Type',
                    message: 'Content-Type must be application/json',
                    code: 'INVALID_CONTENT_TYPE'
                });
            }
        }

        // Validate request method
        const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({
                error: 'Method Not Allowed',
                message: `Method ${req.method} not allowed`,
                code: 'METHOD_NOT_ALLOWED',
                allowedMethods
            });
        }

        next();
    }

    // IP filtering middleware
    ipFilter(req, res, next) {
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Log request for security monitoring
        logger.security('request_received', {
            ip: clientIP,
            method: req.method,
            url: req.originalUrl,
            user_agent: req.get('User-Agent')
        });

        // Check for suspicious patterns
        if (this.isSuspiciousRequest(req)) {
            logger.security('suspicious_request', {
                ip: clientIP,
                method: req.method,
                url: req.originalUrl,
                user_agent: req.get('User-Agent'),
                headers: req.headers
            });

            return res.status(403).json({
                error: 'Forbidden',
                message: 'Request blocked for security reasons',
                code: 'SUSPICIOUS_REQUEST'
            });
        }

        next();
    }

    // Request sanitization middleware
    sanitizeRequest(req, res, next) {
        // Sanitize request body
        if (req.body && typeof req.body === 'object') {
            req.body = this.sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query && typeof req.query === 'object') {
            req.query = this.sanitizeObject(req.query);
        }

        // Sanitize URL parameters
        if (req.params && typeof req.params === 'object') {
            req.params = this.sanitizeObject(req.params);
        }

        next();
    }

    // Check if request is suspicious
    isSuspiciousRequest(req) {
        const userAgent = req.get('User-Agent') || '';
        const url = req.originalUrl || '';

        // Check for common attack patterns
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /onclick=/i,
            /union\s+select/i,
            /drop\s+table/i,
            /insert\s+into/i,
            /delete\s+from/i,
            /update\s+set/i,
            /exec\s*\(/i,
            /eval\s*\(/i,
            /document\./i,
            /window\./i,
            /\.\.\//i, // Directory traversal
            /%00/i, // Null byte injection
            /%0d%0a/i, // CRLF injection
        ];

        // Check URL and user agent for suspicious patterns
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(url) || pattern.test(userAgent)) {
                return true;
            }
        }

        // Check for excessive requests (basic rate limiting)
        const clientIP = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!this.requestCounts) {
            this.requestCounts = new Map();
        }

        if (!this.requestCounts.has(clientIP)) {
            this.requestCounts.set(clientIP, { count: 0, resetTime: now + 60000 });
        }

        const clientData = this.requestCounts.get(clientIP);
        
        if (now > clientData.resetTime) {
            clientData.count = 0;
            clientData.resetTime = now + 60000;
        }

        clientData.count++;

        // Block if more than 100 requests per minute
        if (clientData.count > 100) {
            return true;
        }

        return false;
    }

    // Sanitize object recursively
    sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // Sanitize key
            const sanitizedKey = this.sanitizeString(key);
            
            // Sanitize value
            let sanitizedValue = value;
            if (typeof value === 'string') {
                sanitizedValue = this.sanitizeString(value);
            } else if (typeof value === 'object') {
                sanitizedValue = this.sanitizeObject(value);
            }

            sanitized[sanitizedKey] = sanitizedValue;
        }

        return sanitized;
    }

    // Sanitize string
    sanitizeString(str) {
        if (typeof str !== 'string') {
            return str;
        }

        // Remove null bytes
        str = str.replace(/\0/g, '');

        // Remove control characters (except newlines and tabs)
        str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        // Basic XSS protection
        str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Remove potential SQL injection patterns
        str = str.replace(/['";\\]/g, '');

        return str;
    }

    // Generate CSRF token
    static generateCSRFToken() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    // Validate CSRF token
    static validateCSRFToken(token, sessionToken) {
        if (!token || !sessionToken) {
            return false;
        }
        return token === sessionToken;
    }

    // Rate limiting helper
    static createRateLimiter(windowMs, maxRequests) {
        const requests = new Map();

        return (req, res, next) => {
            const clientIP = req.ip || req.connection.remoteAddress;
            const now = Date.now();

            if (!requests.has(clientIP)) {
                requests.set(clientIP, { count: 0, resetTime: now + windowMs });
            }

            const clientData = requests.get(clientIP);

            if (now > clientData.resetTime) {
                clientData.count = 0;
                clientData.resetTime = now + windowMs;
            }

            clientData.count++;

            if (clientData.count > maxRequests) {
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
                });
            }

            next();
        };
    }

    // Input validation helper
    static validateInput(data, schema) {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            if (value !== undefined && value !== null) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`${field} must be of type ${rules.type}`);
                }

                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters long`);
                }

                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
                }

                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push(`${field} format is invalid`);
                }

                if (rules.enum && !rules.enum.includes(value)) {
                    errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Clean up old request counts
    cleanupRequestCounts() {
        const now = Date.now();
        
        if (this.requestCounts) {
            for (const [ip, data] of this.requestCounts.entries()) {
                if (now > data.resetTime) {
                    this.requestCounts.delete(ip);
                }
            }
        }
    }
}

// Create and export security middleware instance
const securityMiddleware = new SecurityMiddleware();

// Export setup function
function setupSecurity(app) {
    securityMiddleware.setupSecurity(app);
}

// Clean up request counts periodically
setInterval(() => {
    securityMiddleware.cleanupRequestCounts();
}, 60000); // Every minute

module.exports = {
    securityMiddleware,
    setupSecurity,
    SecurityMiddleware
};
