const Joi = require('joi');

/**
 * Validate request body against a Joi schema
 */
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace request body with validated data
    req.body = value;
    next();
  };
};

/**
 * Validate request query parameters against a Joi schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
    }

    // Replace request query with validated data
    req.query = value;
    next();
  };
};

/**
 * Validate request parameters against a Joi schema
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Parameter validation failed',
        details: errors
      });
    }

    // Replace request params with validated data
    req.params = value;
    next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // User schemas
  user: {
    register: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      name: Joi.string().min(2).max(100).required(),
      avatar: Joi.string().uri().optional(),
      preferences: Joi.object().optional()
    }),

    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }),

    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      avatar: Joi.string().uri().optional(),
      preferences: Joi.object().optional(),
      aiPersona: Joi.string().optional(),
      theme: Joi.string().valid('light', 'dark', 'auto').optional()
    })
  },

  // AI schemas
  ai: {
    chat: Joi.object({
      message: Joi.string().min(1).max(10000).required(),
      context: Joi.object().optional(),
      persona: Joi.string().optional(),
      options: Joi.object().optional()
    }),

    generate: Joi.object({
      prompt: Joi.string().min(1).max(5000).required(),
      type: Joi.string().valid('text', 'code', 'image', 'audio').optional(),
      options: Joi.object().optional()
    }),

    analyze: Joi.object({
      content: Joi.alternatives().try(
        Joi.string(),
        Joi.binary()
      ).required(),
      type: Joi.string().valid('text', 'image', 'audio', 'video').optional(),
      analysisType: Joi.string().optional()
    }),

    translate: Joi.object({
      text: Joi.string().min(1).max(10000).required(),
      from: Joi.string().length(2).optional(),
      to: Joi.string().length(2).required(),
      context: Joi.string().optional()
    }),

    summarize: Joi.object({
      text: Joi.string().min(10).max(50000).required(),
      length: Joi.string().valid('short', 'medium', 'long').optional(),
      style: Joi.string().valid('informative', 'casual', 'formal').optional()
    }),

    classify: Joi.object({
      content: Joi.alternatives().try(
        Joi.string(),
        Joi.binary()
      ).required(),
      categories: Joi.array().items(Joi.string()).optional(),
      confidence: Joi.number().min(0).max(1).optional()
    }),

    extract: Joi.object({
      text: Joi.string().min(1).max(10000).required(),
      entities: Joi.array().items(Joi.string()).optional(),
      format: Joi.string().valid('json', 'xml', 'csv').optional()
    }),

    sentiment: Joi.object({
      text: Joi.string().min(1).max(10000).required(),
      detailed: Joi.boolean().optional()
    }),

    embed: Joi.object({
      text: Joi.string().min(1).max(10000).required(),
      model: Joi.string().optional()
    })
  },

  // File schemas
  file: {
    upload: Joi.object({
      file: Joi.binary().required(),
      category: Joi.string().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      privacy: Joi.string().valid('public', 'private', 'family').optional(),
      metadata: Joi.object().optional()
    })
  },

  // Community schemas
  community: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(1000).optional(),
      privacy: Joi.string().valid('public', 'private', 'invite-only').optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      avatar: Joi.string().uri().optional()
    }),

    message: Joi.object({
      content: Joi.string().min(1).max(5000).required(),
      type: Joi.string().valid('text', 'image', 'file', 'poll').optional(),
      metadata: Joi.object().optional()
    })
  },

  // Event schemas
  event: {
    create: Joi.object({
      title: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(2000).optional(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      location: Joi.string().optional(),
      type: Joi.string().valid('personal', 'work', 'family', 'community').optional(),
      privacy: Joi.string().valid('public', 'private', 'family').optional(),
      attendees: Joi.array().items(Joi.string().email()).optional()
    })
  },

  // Task schemas
  task: {
    create: Joi.object({
      title: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(1000).optional(),
      priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
      dueDate: Joi.date().iso().optional(),
      category: Joi.string().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      assignees: Joi.array().items(Joi.string().email()).optional()
    })
  },

  // Health schemas
  health: {
    mood: Joi.object({
      score: Joi.number().min(1).max(10).required(),
      notes: Joi.string().max(500).optional(),
      activities: Joi.array().items(Joi.string()).optional(),
      sleepHours: Joi.number().min(0).max(24).optional(),
      exerciseMinutes: Joi.number().min(0).optional()
    }),

    symptom: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      severity: Joi.number().min(1).max(10).required(),
      duration: Joi.string().optional(),
      notes: Joi.string().max(500).optional(),
      category: Joi.string().optional()
    })
  },

  // Finance schemas
  finance: {
    transaction: Joi.object({
      amount: Joi.number().precision(2).required(),
      type: Joi.string().valid('income', 'expense', 'transfer').required(),
      category: Joi.string().required(),
      description: Joi.string().max(200).optional(),
      date: Joi.date().iso().optional(),
      tags: Joi.array().items(Joi.string()).optional()
    }),

    budget: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      amount: Joi.number().precision(2).required(),
      period: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
      categories: Joi.array().items(Joi.string()).optional(),
      startDate: Joi.date().iso().optional()
    })
  },

  // Learning schemas
  learning: {
    course: Joi.object({
      title: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(1000).optional(),
      category: Joi.string().required(),
      difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
      duration: Joi.number().min(1).optional(),
      tags: Joi.array().items(Joi.string()).optional()
    }),

    progress: Joi.object({
      courseId: Joi.string().required(),
      completedModules: Joi.array().items(Joi.string()).optional(),
      score: Joi.number().min(0).max(100).optional(),
      timeSpent: Joi.number().min(0).optional(),
      notes: Joi.string().max(500).optional()
    })
  },

  // Search schemas
  search: {
    query: Joi.object({
      q: Joi.string().min(1).max(500).required(),
      type: Joi.string().valid('all', 'text', 'voice', 'image').optional(),
      filters: Joi.object().optional(),
      page: Joi.number().min(1).optional(),
      limit: Joi.number().min(1).max(100).optional()
    })
  },

  // Pagination schemas
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
  }),

  // ID schemas
  id: Joi.object({
    id: Joi.string().required()
  }),

  // UUID schemas
  uuid: Joi.object({
    id: Joi.string().uuid().required()
  })
};

/**
 * Sanitize HTML content
 */
const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Sanitize SQL injection
 */
const sanitizeSql = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Basic SQL injection prevention
  return input
    .replace(/'/g, "''")
    .replace(/--/g, '')
    .replace(/;/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
};

/**
 * Sanitize XSS
 */
const sanitizeXss = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email.trim().toLowerCase();
};

/**
 * Sanitize phone number
 */
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') {
    return '';
  }
  
  return phone.replace(/\D/g, '');
};

/**
 * Sanitize URL
 */
const sanitizeUrl = (url) => {
  if (typeof url !== 'string') {
    return '';
  }
  
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj, sanitizers = {}) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, sanitizers));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sanitizers[key]) {
      sanitized[key] = sanitizers[key](value);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeXss(value);
    } else {
      sanitized[key] = sanitizeObject(value, sanitizers);
    }
  }
  
  return sanitized;
};

/**
 * Create error response
 */
const createValidationError = (field, message) => ({
  field,
  message
});

/**
 * Check if value is empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
};

/**
 * Truncate string
 */
const truncate = (str, length = 100) => {
  if (typeof str !== 'string') {
    return str;
  }
  
  if (str.length <= length) {
    return str;
  }
  
  return str.substring(0, length) + '...';
};

/**
 * Generate random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate UUID
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

module.exports = {
  validateInput,
  validateQuery,
  validateParams,
  schemas,
  sanitizeHtml,
  sanitizeSql,
  sanitizeXss,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeObject,
  createValidationError,
  isEmpty,
  truncate,
  generateRandomString,
  generateUUID
};

