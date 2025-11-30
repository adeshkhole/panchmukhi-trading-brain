const jwt = require('jsonwebtoken');
const { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } = require('../constants');
const { User } = require('../models');
const logger = require('../utils/logger');
const config = require('../config/app.config');

/**
 * Middleware to authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      // Get user from database
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Account is deactivated',
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    next(error);
  }
};

/**
 * Middleware to check if user has required roles
 * @param {...string} roles - List of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.FORBIDDEN,
        });
      }
      
      next();
    } catch (error) {
      logger.error(`Authorization error: ${error.message}`);
      next(error);
    }
  };
};

/**
 * Middleware to check if user is the owner of the resource or admin
 * @param {string} modelName - Name of the model to check ownership
 * @param {string} idParam - Name of the parameter containing the resource ID
 * @param {string} userField - Name of the field that references the user
 */
const checkOwnership = (modelName, idParam = 'id', userField = 'userId') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}`);
      const resource = await Model.findByPk(req.params[idParam]);
      
      if (!resource) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Resource not found',
        });
      }
      
      // Allow admin to access any resource
      if (req.user.role === USER_ROLES.ADMIN) {
        return next();
      }
      
      // Check if user is the owner of the resource
      if (resource[userField] !== req.user.id) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to access this resource',
        });
      }
      
      next();
    } catch (error) {
      logger.error(`Ownership check error: ${error.message}`);
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
};
