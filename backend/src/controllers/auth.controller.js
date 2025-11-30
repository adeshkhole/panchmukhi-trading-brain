const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const config = require('../config/app.config');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} - JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return error(
        res,
        'Email is already registered',
        HTTP_STATUS.CONFLICT,
        'EMAIL_EXISTS'
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    return success(
      res,
      { user: userData, token },
      SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      HTTP_STATUS.CREATED
    );
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    next(err);
  }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return error(
        res,
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
        'INVALID_CREDENTIALS'
      );
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(
        res,
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HTTP_STATUS.UNAUTHORIZED,
        'INVALID_CREDENTIALS'
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return error(
        res,
        'Your account has been deactivated',
        HTTP_STATUS.FORBIDDEN,
        'ACCOUNT_DEACTIVATED'
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    return success(
      res,
      { user: userData, token },
      SUCCESS_MESSAGES.LOGIN_SUCCESS
    );
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    next(err);
  }
};

/**
 * Get current user profile
 * @route GET /api/v1/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return error(
        res,
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        'USER_NOT_FOUND'
      );
    }

    return success(res, { user });
  } catch (err) {
    logger.error(`Get profile error: ${err.message}`);
    next(err);
  }
};

/**
 * Update user profile
 * @route PUT /api/v1/auth/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return error(
        res,
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        'USER_NOT_FOUND'
      );
    }

    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    return success(
      res,
      { user: userData },
      SUCCESS_MESSAGES.PROFILE_UPDATED
    );
  } catch (err) {
    logger.error(`Update profile error: ${err.message}`);
    next(err);
  }
};

/**
 * Change password
 * @route PUT /api/v1/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return error(
        res,
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        'USER_NOT_FOUND'
      );
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return error(
        res,
        'Current password is incorrect',
        HTTP_STATUS.BAD_REQUEST,
        'INVALID_PASSWORD'
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return success(res, null, 'Password updated successfully');
  } catch (err) {
    logger.error(`Change password error: ${err.message}`);
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
