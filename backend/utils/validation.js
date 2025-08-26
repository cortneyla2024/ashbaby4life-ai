const Joi = require('joi');
const { escape } = require('html-escaper');
const { v4: uuidv4 } = require('uuid');

// Common validation schemas
const schemas = {
  // User validation
  user: {
    create: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      firstName: Joi.string().min(1).max(50).required(),
      lastName: Joi.string().min(1).max(50).required(),
      dateOfBirth: Joi.date().max('now').optional(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
      timezone: Joi.string().valid(...require('moment-timezone').tz.names()).optional(),
      preferences: Joi.object().optional()
    }),

    update: Joi.object({
      email: Joi.string().email().optional(),
      firstName: Joi.string().min(1).max(50).optional(),
      lastName: Joi.string().min(1).max(50).optional(),
      dateOfBirth: Joi.date().max('now').optional(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
      timezone: Joi.string().valid(...require('moment-timezone').tz.names()).optional(),
      preferences: Joi.object().optional(),
      avatar: Joi.string().uri().optional(),
      bio: Joi.string().max(500).optional()
    }),

    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      rememberMe: Joi.boolean().optional()
    })
  },

  // AI interaction validation
  ai: {
    message: Joi.object({
      content: Joi.string().min(1).max(10000).required(),
      sessionId: Joi.string().uuid().optional(),
      persona: Joi.string().valid('educator', 'therapist', 'creative', 'legal_advocate', 'financial_advisor', 'balanced').optional(),
      context: Joi.object().optional(),
      options: Joi.object({
        maxTokens: Joi.number().integer().min(1).max(4000).optional(),
        temperature: Joi.number().min(0).max(2).optional(),
        includeReasoning: Joi.boolean().optional(),
        includeSuggestions: Joi.boolean().optional()
      }).optional()
    }),

    session: Joi.object({
      sessionId: Joi.string().uuid().required(),
      topic: Joi.string().max(200).optional(),
      persona: Joi.string().valid('educator', 'therapist', 'creative', 'legal_advocate', 'financial_advisor', 'balanced').optional(),
      config: Joi.object().optional()
    })
  },

  // Mental health validation
  mentalHealth: {
    moodEntry: Joi.object({
      mood: Joi.number().integer().min(1).max(10).required(),
      energy: Joi.number().integer().min(1).max(10).optional(),
      activities: Joi.array().items(Joi.string()).max(10).optional(),
      notes: Joi.string().max(1000).optional(),
      timestamp: Joi.date().max('now').optional()
    }),

    assessment: Joi.object({
      answers: Joi.array().items(
        Joi.object({
          questionId: Joi.string().required(),
          answer: Joi.alternatives().try(
            Joi.number().integer().min(1).max(5),
            Joi.string().max(500)
          ).required()
        })
      ).min(1).required(),
      type: Joi.string().valid('anxiety', 'depression', 'stress', 'general').required()
    })
  },

  // Financial validation
  finance: {
    budget: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      amount: Joi.number().positive().required(),
      category: Joi.string().min(1).max(50).required(),
      period: Joi.string().valid('weekly', 'monthly', 'yearly').required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().min(Joi.ref('startDate')).optional(),
      description: Joi.string().max(500).optional()
    }),

    transaction: Joi.object({
      amount: Joi.number().required(),
      category: Joi.string().min(1).max(50).required(),
      description: Joi.string().max(200).required(),
      date: Joi.date().max('now').optional(),
      type: Joi.string().valid('income', 'expense').required(),
      budgetId: Joi.string().uuid().optional(),
      tags: Joi.array().items(Joi.string()).max(10).optional()
    })
  },

  // File upload validation
  file: {
    upload: Joi.object({
      filename: Joi.string().min(1).max(255).required(),
      mimetype: Joi.string().valid(
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/json',
        'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'
      ).required(),
      size: Joi.number().integer().max(50 * 1024 * 1024).required(), // 50MB max
      category: Joi.string().valid('avatar', 'document', 'media', 'backup').required()
    })
  },

  // Video call validation
  videoCall: {
    session: Joi.object({
      sessionId: Joi.string().uuid().required(),
      aiPersona: Joi.string().valid('educator', 'therapist', 'creative', 'legal_advocate', 'financial_advisor', 'balanced').optional(),
      topic: Joi.string().max(200).optional(),
      duration: Joi.number().integer().min(1).max(480).optional(), // max 8 hours
      quality: Joi.string().valid('low', 'medium', 'high').optional()
    })
  },

  // Community validation
  community: {
    post: Joi.object({
      title: Joi.string().min(1).max(200).required(),
      content: Joi.string().min(1).max(10000).required(),
      category: Joi.string().min(1).max(50).required(),
      tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
      isAnonymous: Joi.boolean().optional(),
      allowComments: Joi.boolean().optional()
    }),

    comment: Joi.object({
      content: Joi.string().min(1).max(2000).required(),
      parentId: Joi.string().uuid().optional(),
      isAnonymous: Joi.boolean().optional()
    })
  }
};

// Validation functions
const validate = (schema, data, options = {}) => {
  const validationOptions = {
    abortEarly: false,
    allowUnknown: options.allowUnknown !== false,
    stripUnknown: options.stripUnknown !== false,
    ...options
  };

  const { error, value } = schema.validate(data, validationOptions);
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));
    
    throw new ValidationError('Validation failed', errors);
  }
  
  return value;
};

// Sanitization functions
const sanitize = {
  // HTML sanitization
  html: (input) => {
    if (typeof input !== 'string') return input;
    return escape(input);
  },

  // SQL injection prevention
  sql: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/'/g, "''")
      .replace(/--/g, '')
      .replace(/;/, '')
      .replace(/\/\*/, '')
      .replace(/\*\//, '');
  },

  // XSS prevention
  xss: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/&/g, '&amp;');
  },

  // Email sanitization
  email: (email) => {
    if (typeof email !== 'string') return email;
    return email.toLowerCase().trim();
  },

  // Phone number sanitization
  phone: (phone) => {
    if (typeof phone !== 'string') return phone;
    return phone.replace(/[^\d\+\(\)\-\s]/g, '').trim();
  },

  // URL sanitization
  url: (url) => {
    if (typeof url !== 'string') return url;
    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch {
      return null;
    }
  },

  // Object sanitization
  object: (obj, allowedFields = []) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const field of allowedFields) {
      if (obj.hasOwnProperty(field)) {
        sanitized[field] = obj[field];
      }
    }
    return sanitized;
  }
};

// Input validation middleware
const validateInput = (schema, options = {}) => {
  return (req, res, next) => {
    try {
      const data = {
        ...req.body,
        ...req.query,
        ...req.params
      };
      
      const validatedData = validate(schema, data, options);
      
      // Replace request data with validated data
      req.body = validatedData;
      req.validated = true;
      
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }
      
      next(error);
    }
  };
};

// Sanitization middleware
const sanitizeInput = (fields = []) => {
  return (req, res, next) => {
    try {
      // Sanitize body
      if (req.body) {
        for (const field of fields) {
          if (req.body[field]) {
            req.body[field] = sanitize.html(req.body[field]);
          }
        }
      }
      
      // Sanitize query parameters
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            req.query[key] = sanitize.html(value);
          }
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// File validation middleware
const validateFile = (options = {}) => {
  return (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          timestamp: new Date().toISOString()
        });
      }
      
      const fileData = {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category: req.body.category || 'document'
      };
      
      const validatedFile = validate(schemas.file.upload, fileData);
      
      req.file.validated = validatedFile;
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'File validation failed',
          details: error.errors,
          timestamp: new Date().toISOString()
        });
      }
      
      next(error);
    }
  };
};

// Custom validation functions
const validators = {
  // Password strength validation
  isStrongPassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: [
        password.length < minLength && 'Password must be at least 8 characters long',
        !hasUpperCase && 'Password must contain at least one uppercase letter',
        !hasLowerCase && 'Password must contain at least one lowercase letter',
        !hasNumbers && 'Password must contain at least one number',
        !hasSpecialChar && 'Password must contain at least one special character'
      ].filter(Boolean)
    };
  },

  // Email format validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // UUID validation
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Date range validation
  isValidDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  },

  // File size validation
  isValidFileSize: (size, maxSize) => {
    return size <= maxSize;
  },

  // File type validation
  isValidFileType: (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
  }
};

// Custom error class
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Utility functions
const utils = {
  // Generate validation error
  createValidationError: (field, message, type = 'any.invalid') => {
    return new ValidationError('Validation failed', [{
      field,
      message,
      type
    }]);
  },

  // Check if value is empty
  isEmpty: (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  // Check if value is not empty
  isNotEmpty: (value) => {
    return !utils.isEmpty(value);
  },

  // Truncate string
  truncate: (str, length = 100, suffix = '...') => {
    if (typeof str !== 'string') return str;
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },

  // Generate random string
  generateRandomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate UUID
  generateUUID: () => {
    return uuidv4();
  }
};

module.exports = {
  schemas,
  validate,
  sanitize,
  validateInput,
  sanitizeInput,
  validateFile,
  validators,
  ValidationError,
  utils
};
