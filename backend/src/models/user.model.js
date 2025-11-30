const bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize');
const BaseModel = require('./base.model');
const { USER_ROLES } = require('../constants');
const logger = require('../utils/logger');

class User extends BaseModel {
  static init(sequelize) {
    const attributes = {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 100],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 100],
        },
      },
      role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLES)),
        defaultValue: USER_ROLES.USER,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_email_verified',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        field: 'last_login_at',
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
        field: 'password_changed_at',
      },
    };

    const options = {
      tableName: 'users',
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
            user.passwordChangedAt = new Date();
          }
        },
      },
    };

    return super.init(attributes, { ...options, sequelize });
  }

  // Instance methods
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  changedPasswordAfter(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }

  // Class methods
  static associate(models) {
    // Define associations here
    this.hasMany(models.Watchlist, {
      foreignKey: 'userId',
      as: 'watchlists',
    });

    this.hasMany(models.Alert, {
      foreignKey: 'userId',
      as: 'alerts',
    });

    this.hasMany(models.Portfolio, {
      foreignKey: 'userId',
      as: 'portfolios',
    });
  }

  // Scopes
  static scopes() {
    return {
      active: {
        where: { isActive: true },
      },
      admin: {
        where: { role: USER_ROLES.ADMIN },
      },
      user: {
        where: { role: USER_ROLES.USER },
      },
    };
  }
}

module.exports = User;
