import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const TemplateVariable = sequelize.define('TemplateVariable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  variableName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'variable_name',
    validate: {
      notEmpty: {
        msg: 'Variable name cannot be empty'
      }
    }
  },
  variableKey: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'variable_key',
    validate: {
      notEmpty: {
        msg: 'Variable key cannot be empty'
      },
      // Enforce camelCase format
      is: {
        args: /^[a-z][a-zA-Z0-9]*$/,
        msg: 'Variable key must be in camelCase format (e.g., firstName, companyName)'
      }
    }
  },
  variableType: {
    type: DataTypes.ENUM('text', 'image', 'link'),
    allowNull: false,
    defaultValue: 'text',
    field: 'variable_type',
    validate: {
      isIn: {
        args: [['text', 'image', 'link']],
        msg: 'Variable type must be text, image, or link'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'template_variables',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default TemplateVariable;
