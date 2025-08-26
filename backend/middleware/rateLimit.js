const rateLimit = require('express-rate-limit');

/**
 * Create a basic rate limiter
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Rate limit configurations
 */
const rateLimitConfigs = {
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many API requests, please try again later.'
  }),

  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again later.'
  }),

  ai: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many AI requests, please try again later.'
  }),

  upload: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many upload requests, please try again later.'
  }),

  search: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many search requests, please try again later.'
  })
};

/**
 * Apply rate limiting based on endpoint type
 */
const applyRateLimit = (endpointType) => {
  return rateLimitConfigs[endpointType] || rateLimitConfigs.general;
};

module.exports = {
  createRateLimiter,
  rateLimitConfigs,
  applyRateLimit
};
