import prisma from '../utils/prisma.js';
import jwt from 'jsonwebtoken';

// admin login with hardcoded credentials
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // check against hardcoded admin credentials from .env
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // generate jwt for admin
      const token = jwt.sign(
        {
          email,
          role: 'admin',
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        token,
        admin: { email },
      });
    }

    return res.status(401).json({ error: 'invalid credentials' });
  } catch (error) {
    console.error('admin login error:', error);
    return res.status(500).json({ error: 'login failed' });
  }
};

// get all users for admin dashboard
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error('get users error:', error);
    return res.status(500).json({ error: 'failed to fetch users' });
  }
};

// approve a user by id
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'approved' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    return res.status(200).json({
      message: 'user approved successfully',
      user,
    });
  } catch (error) {
    console.error('approve user error:', error);
    return res.status(500).json({ error: 'failed to approve user' });
  }
};
