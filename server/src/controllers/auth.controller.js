import User from '../models/user.js';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// google oauth login handler
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'id token is required' });
    }

    // verify google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    // upsert user in database
    const [user, created] = await User.findOrCreate({
      where: { googleId },
      defaults: {
        name,
        email,
        photo: picture,
        status: 'pending',
      },
    });

    if (!created) {
      await user.update({
        name,
        email,
        photo: picture,
      });
    }

    // check user approval status
    if (user.status === 'pending') {
      return res.status(200).json({
        status: 'pending',
        message: 'your account is waiting for admin approval',
      });
    }

    // user is approved, generate jwt
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: 'user',
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'approved',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error('google login error:', error);
    return res.status(500).json({ error: 'authentication failed' });
  }
};

// import Gmail OAuth utilities
import { getAuthUrl, getTokensFromCode, refreshAccessToken, isTokenExpired } from '../utils/gmailAuth.js';

// initiate Gmail OAuth flow
export const initiateGmailAuth = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    
    const authUrl = getAuthUrl(userId);
    return res.status(200).json({ authUrl });
  } catch (error) {
    console.error('initiate gmail auth error:', error);
    return res.status(500).json({ error: 'failed to initiate Gmail authentication' });
  }
};

// handle Gmail OAuth callback
export const gmailCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'missing code or state parameter' });
    }

    const userId = parseInt(state);
    
    // exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    // save tokens to database
    await User.update({
      gmailAccessToken: tokens.access_token,
      gmailRefreshToken: tokens.refresh_token,
      gmailTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      gmailConnected: true,
    }, {
      where: { id: userId }
    });

    // redirect to frontend success page
    return res.redirect(`${process.env.FRONTEND_URL}/gmail-callback?success=true`);
  } catch (error) {
    console.error('gmail callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/gmail-callback?success=false&error=${encodeURIComponent(error.message)}`);
  }
};

// check Gmail connection status
export const checkGmailConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['gmailConnected', 'gmailTokenExpiry'],
    });

    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    return res.status(200).json({
      connected: user.gmailConnected,
      tokenExpired: user.gmailTokenExpiry ? isTokenExpired(user.gmailTokenExpiry) : true,
    });
  } catch (error) {
    console.error('check gmail connection error:', error);
    return res.status(500).json({ error: 'failed to check Gmail connection' });
  }
};

// disconnect Gmail
export const disconnectGmail = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await User.update({
      gmailAccessToken: null,
      gmailRefreshToken: null,
      gmailTokenExpiry: null,
      gmailConnected: false,
    }, {
      where: { id: userId }
    });

    return res.status(200).json({ message: 'Gmail disconnected successfully' });
  } catch (error) {
    console.error('disconnect gmail error:', error);
    return res.status(500).json({ error: 'failed to disconnect Gmail' });
  }
};

// pre-authentication endpoint
export const preAuth = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    if (password === 'raghav2026') {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (error) {
    console.error('pre-auth error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

