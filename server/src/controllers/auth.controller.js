import prisma from '../utils/prisma.js';
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
    const user = await prisma.user.upsert({
      where: { googleId },
      update: {
        name,
        email,
        photo: picture,
      },
      create: {
        googleId,
        name,
        email,
        photo: picture,
        status: 'pending', // default status is pending
      },
    });

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
