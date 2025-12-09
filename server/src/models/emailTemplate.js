import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const EmailTemplate = sequelize.define('EmailTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'email_templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default EmailTemplate;
