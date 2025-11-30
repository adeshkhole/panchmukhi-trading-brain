const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const logger = require('../utils/logger');

class BaseModel extends Sequelize.Model {
  /**
   * Initialize the model
   * @param {Object} attributes - Model attributes
   * @param {Object} options - Model options
   */
  static init(attributes, options = {}) {
    const defaultOptions = {
      sequelize,
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: false, // Set to true to enable soft deletes
      ...options,
    };

    super.init(attributes, defaultOptions);

    // Add hooks
    this.addHooks();
    
    return this;
  }

  /**
   * Add model hooks
   */
  static addHooks() {
    // Add any common hooks here
    this.addHook('beforeCreate', (instance) => {
      logger.info(`Creating new ${this.name} with ID: ${instance.id}`);
    });

    this.addHook('afterCreate', (instance) => {
      logger.info(`Created ${this.name} with ID: ${instance.id}`);
    });
  }

  /**
   * Apply pagination to a query
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.order - Sort order (e.g., 'createdAt DESC')
   * @returns {Object} - Pagination options for Sequelize
   */
  static paginate({ page = 1, limit = 20, order = [['created_at', 'DESC']] } = {}) {
    const offset = (page - 1) * limit;
    return {
      offset,
      limit,
      order,
    };
  }

  /**
   * Format the model instance to JSON
   * @param {Object} options - Options for toJSON
   * @returns {Object} - Formatted object
   */
  toJSON() {
    // Get the plain object
    const values = Object.assign({}, this.get());

    // Remove sensitive fields
    const hiddenFields = ['password', 'refresh_token', 'reset_password_token'];
    hiddenFields.forEach((field) => {
      if (field in values) {
        delete values[field];
      }
    });

    // Format dates
    const dateFields = ['created_at', 'updated_at', 'deleted_at'];
    dateFields.forEach((field) => {
      if (values[field]) {
        values[field] = new Date(values[field]).toISOString();
      }
    });

    return values;
  }
}

module.exports = BaseModel;
