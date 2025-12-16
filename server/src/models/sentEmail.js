import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const SentEmail = sequelize.define('SentEmail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  scheduledEmailId: {
    type: DataTypes.INTEGER,
    field: 'scheduled_email_id',
    allowNull: true,
    references: {
      model: 'scheduled_emails',
      key: 'id'
    }
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
  rowId: {
    type: DataTypes.INTEGER,
    field: 'row_id',
    allowNull: true,
    references: {
      model: 'uploaded_rows',
      key: 'id'
    }
  },
  recipientEmail: {
    type: DataTypes.STRING,
    field: 'recipient_email',
    allowNull: false
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('sent', 'failed'),
    allowNull: false
  },
  messageId: {
    type: DataTypes.STRING,
    field: 'message_id',
    allowNull: true
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    field: 'sent_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sent_emails',
  timestamps: false,
  indexes: [
    {
      fields: ['scheduled_email_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    }
  ]
});

export default SentEmail;
