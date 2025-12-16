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
  website: {
    type: DataTypes.TEXT,
    field: 'website',
    allowNull: true
  },
  competitorName2: {
    type: DataTypes.STRING,
    field: 'competitor_name_2',
    allowNull: true
  },
  competitorTraffic2: {
    type: DataTypes.INTEGER,
    field: 'competitor_traffic_2',
    allowNull: true
  },
  competitorWebsite2: {
    type: DataTypes.STRING,
    field: 'competitor_website_2',
    allowNull: true
  },
  competitorScreenshotUrl: {
    type: DataTypes.TEXT,
    field: 'competitor_screenshot_url',
    allowNull: true
  },
  rawData: {
    type: DataTypes.TEXT,
    field: 'raw_data',
    allowNull: true,
    comment: 'JSON string of all Excel columns for dynamic variable support'
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
