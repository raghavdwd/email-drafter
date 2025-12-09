import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const UploadedRow = sequelize.define('UploadedRow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fileId: {
    type: DataTypes.STRING,
    field: 'file_id',
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    field: 'first_name',
    allowNull: true
  },
  clientBusinessName: {
    type: DataTypes.STRING,
    field: 'client_business_name',
    allowNull: true
  },
  clientTraffic: {
    type: DataTypes.INTEGER,
    field: 'client_traffic',
    allowNull: true
  },
  competitorName: {
    type: DataTypes.STRING,
    field: 'competitor_name',
    allowNull: true
  },
  competitorTraffic: {
    type: DataTypes.INTEGER,
    field: 'competitor_traffic',
    allowNull: true
  },
  competitorWebsite: {
    type: DataTypes.STRING,
    field: 'competitor_website',
    allowNull: true
  },
  calendarLink: {
    type: DataTypes.TEXT,
    field: 'calendar_link',
    allowNull: true
  },
  clientScreenshotUrl: {
    type: DataTypes.TEXT,
    field: 'client_screenshot_url',
    allowNull: true
  },
  sendingAccountName: {
    type: DataTypes.STRING,
    field: 'sending_account_name',
    allowNull: true
  },
  assessment: {
    type: DataTypes.TEXT,
    field: 'assessment',
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'uploaded_rows',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['file_id']
    }
  ]
});

export default UploadedRow;
