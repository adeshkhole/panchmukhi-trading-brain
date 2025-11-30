const Joi = require('joi');
const { VALIDATION_PATTERNS } = require('../constants');

// Common validation schemas
const schemas = {
  // Authentication
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(VALIDATION_PATTERNS.PASSWORD).required()
      .messages({
        'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    role: Joi.string().valid('user', 'analyst').default('user'),
  }),

  // Market data
  symbol: Joi.object({
    symbol: Joi.string().pattern(VALIDATION_PATTERNS.SYMBOL).required(),
  }),

  timeRange: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().min(Joi.ref('start')).required(),
    interval: Joi.string().valid('1m', '5m', '15m', '1h', '4h', '1d', '1w'),
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Watchlist
  watchlist: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    symbols: Joi.array().items(Joi.string().pattern(VALIDATION_PATTERNS.SYMBOL)),
    isDefault: Joi.boolean(),
  }),

  // Alert
  alert: Joi.object({
    symbol: Joi.string().pattern(VALIDATION_PATTERNS.SYMBOL).required(),
    condition: Joi.string().valid('above', 'below', 'equals').required(),
    price: Joi.number().positive().required(),
    isActive: Joi.boolean().default(true),
  }),
};

/**
 * Validates request data against a schema
 * @param {Object} data - Data to validate
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Object} - Object with validation result
 */
const validate = (data, schema) => {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, ''),
      type: detail.type,
    }));

    return { error: errors };
  }

  return { value };
};

/**
 * Middleware to validate request data
 * @param {string} schemaName - Name of the schema to validate against
 * @param {string} dataSource - Where to get the data from (body, query, params)
 * @returns {Function} Express middleware function
 */
const validateRequest = (schemaName, dataSource = 'body') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return next(new Error(`Schema '${schemaName}' not found`));
    }

    const data = req[dataSource];
    const { error, value } = validate(data, schema);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error,
      });
    }

    // Replace request data with validated data
    req[dataSource] = value;
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateRequest,
};
