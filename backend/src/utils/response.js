const { HTTP_STATUS } = require('../constants');

/**
 * Standard success response format
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata for pagination or other info
 */
const success = (res, data = null, message = 'Operation completed successfully', statusCode = HTTP_STATUS.OK, meta = {}) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(Object.keys(meta).length > 0 && { meta }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Standard error response format
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} errorCode - Application-specific error code
 * @param {Array} errors - Array of validation errors or additional error details
 */
const error = (res, message = 'Internal server error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = null, errors = []) => {
  const response = {
    success: false,
    message,
    ...(errorCode && { errorCode }),
    ...(errors.length > 0 && { errors }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Standard validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @param {string} message - Error message (default: 'Validation Error')
 */
const validationError = (res, errors = [], message = 'Validation Error') => {
  return error(
    res,
    message,
    HTTP_STATUS.BAD_REQUEST,
    'VALIDATION_ERROR',
    errors
  );
};

/**
 * Standard not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Resource not found')
 */
const notFound = (res, message = 'Resource not found') => {
  return error(res, message, HTTP_STATUS.NOT_FOUND, 'RESOURCE_NOT_FOUND');
};

/**
 * Standard unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Unauthorized')
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
};

/**
 * Standard forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Forbidden')
 */
const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
};

/**
 * Standard rate limit exceeded response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Too many requests, please try again later')
 */
const tooManyRequests = (res, message = 'Too many requests, please try again later') => {
  return error(res, message, HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
};

/**
 * Standard bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Bad Request')
 * @param {string} errorCode - Application-specific error code
 */
const badRequest = (res, message = 'Bad Request', errorCode = 'BAD_REQUEST') => {
  return error(res, message, HTTP_STATUS.BAD_REQUEST, errorCode);
};

module.exports = {
  success,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  tooManyRequests,
  badRequest,
};
