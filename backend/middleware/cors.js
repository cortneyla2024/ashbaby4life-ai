const cors = require('cors');
const config = require('../config/config');
const logger = require('../utils/logger');

class CORSMiddleware {
    constructor() {
        this.setupCORS = this.setupCORS.bind(this);
    }

    setupCORS(app) {
        // CORS configuration
        const corsOptions = {
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) {
                    return callback(null, true);
                }

                // Check if origin is in allowed list
                if (config.security.corsOrigins.includes(origin)) {
                    return callback(null, true);
                }

                // Check if origin matches any wildcard patterns
                const isAllowed = config.security.corsOrigins.some(allowedOrigin => {
                    if (allowedOrigin.startsWith('*.')) {
                        const domain = allowedOrigin.substring(2);
                        return origin.endsWith(domain);
                    }
                    return false;
                });

                if (isAllowed) {
                    return callback(null, true);
                }

                // Log blocked origin
                logger.security('cors_blocked', {
                    origin,
                    allowed_origins: config.security.corsOrigins
                });

                return callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'Accept',
                'Origin',
                'Cache-Control',
                'X-File-Name',
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection'
            ],
            exposedHeaders: [
                'Content-Length',
                'Content-Range',
                'X-Total-Count',
                'X-Page-Count',
                'X-Current-Page'
            ],
            maxAge: 86400, // 24 hours
            preflightContinue: false,
            optionsSuccessStatus: 204
        };

        // Apply CORS middleware
        app.use(cors(corsOptions));

        // Additional CORS headers for preflight requests
        app.use((req, res, next) => {
            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Origin', req.headers.origin);
                res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection');
                res.header('Access-Control-Allow-Credentials', 'true');
                res.header('Access-Control-Max-Age', '86400');
                res.status(204).end();
                return;
            }

            // Add CORS headers for all responses
            if (req.headers.origin) {
                res.header('Access-Control-Allow-Origin', req.headers.origin);
            }
            res.header('Access-Control-Allow-Credentials', 'true');

            next();
        });

        logger.startup('CORS Middleware');
    }

    // Validate origin
    static validateOrigin(origin) {
        if (!origin) {
            return true; // Allow requests with no origin
        }

        return config.security.corsOrigins.some(allowedOrigin => {
            if (allowedOrigin === '*') {
                return true;
            }
            if (allowedOrigin.startsWith('*.')) {
                const domain = allowedOrigin.substring(2);
                return origin.endsWith(domain);
            }
            return origin === allowedOrigin;
        });
    }

    // Get allowed origins
    static getAllowedOrigins() {
        return config.security.corsOrigins;
    }

    // Add origin to allowed list (runtime)
    static addAllowedOrigin(origin) {
        if (!config.security.corsOrigins.includes(origin)) {
            config.security.corsOrigins.push(origin);
            logger.info('CORS origin added', { origin });
        }
    }

    // Remove origin from allowed list (runtime)
    static removeAllowedOrigin(origin) {
        const index = config.security.corsOrigins.indexOf(origin);
        if (index > -1) {
            config.security.corsOrigins.splice(index, 1);
            logger.info('CORS origin removed', { origin });
        }
    }
}

// Create and export CORS middleware instance
const corsMiddleware = new CORSMiddleware();

// Export setup function
function setupCORS(app) {
    corsMiddleware.setupCORS(app);
}

module.exports = {
    corsMiddleware,
    setupCORS,
    CORSMiddleware
};
