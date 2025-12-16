import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const ScheduledEmail = sequelize.define('ScheduledEmail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fileId: {
    type: DataTypes.STRING,
    field: 'file_id',
    allowNull: false
  },
  templateId: {
    type: DataTypes.INTEGER,
    field: 'template_id',
    allowNull: false,
    references: {
      model: 'email_templates',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'paused', 'completed', 'cancelled', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  timeIntervalSeconds: {
    type: DataTypes.INTEGER,
    field: 'time_interval_seconds',
    allowNull: false,
    defaultValue: 60
  },
  currentIndex: {
    type: DataTypes.INTEGER,
    field: 'current_index',
    allowNull: false,
    defaultValue: 0
  },
  totalCount: {
    type: DataTypes.INTEGER,
    field: 'total_count',
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  startedAt: {
    type: DataTypes.DATE,
    field: 'started_at',
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at',
    allowNull: true
  }
}, {
  tableName: 'scheduled_emails',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['file_id']
    }
  ]
});

export default ScheduledEmail;
