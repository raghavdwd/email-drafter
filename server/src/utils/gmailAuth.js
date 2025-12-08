import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.compose',
];

/**
 * Create OAuth2 client
 */
export const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL}/auth/gmail/callback`
  );
};

/**
 * Generate authorization URL for Gmail OAuth
 * @param {string} userId - User ID to include in state parameter
 * @returns {string} - Authorization URL
 */
export const getAuthUrl = (userId) => {
  const oauth2Client = createOAuth2Client();
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId.toString(),
    prompt: 'consent', // Force consent screen to get refresh token
  });

  return authUrl;
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} - Tokens object with access_token, refresh_token, expiry_date
 */
export const getTokensFromCode = async (code) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New tokens object
 */
export const refreshAccessToken = async (refreshToken) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};

/**
 * Create authenticated Gmail client
 * @param {Object} user - User object with Gmail tokens
 * @returns {Object} - Authenticated Gmail client
 */
export const getGmailClient = (user) => {
  const oauth2Client = createOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: user.gmailAccessToken,
    refresh_token: user.gmailRefreshToken,
    expiry_date: user.gmailTokenExpiry ? new Date(user.gmailTokenExpiry).getTime() : null,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Check if token is expired
 * @param {Date} expiryDate - Token expiry date
 * @returns {boolean} - True if expired
 */
export const isTokenExpired = (expiryDate) => {
  if (!expiryDate) return true;
  return new Date(expiryDate).getTime() < Date.now();
};
