import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'google_id',
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved'),
    defaultValue: 'pending',
    allowNull: false
  },
  gmailAccessToken: {
    type: DataTypes.TEXT,
    field: 'gmail_access_token',
    allowNull: true
  },
  gmailRefreshToken: {
    type: DataTypes.TEXT,
    field: 'gmail_refresh_token',
    allowNull: true
  },
  gmailTokenExpiry: {
    type: DataTypes.DATE,
    field: 'gmail_token_expiry',
    allowNull: true
  },
  gmailConnected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'gmail_connected',
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // Prisma schema didn't explicit updatedAt, but Sequelize adds it by default usually. Schema had createdAt. We can disable updatedAt if not needed or map it if it exists in DB. Schema didn't have updatedAt, so setting to false.
});

export default User;
