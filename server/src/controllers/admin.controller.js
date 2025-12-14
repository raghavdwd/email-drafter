import User from '../models/user.js';
import EmailTemplate from '../models/emailTemplate.js';
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
      // Generate JWT token for admin
      const token = jwt.sign(
        {
          id: 'admin',
          email,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const adminUser = {
        id: 'admin',
        email,
        role: 'admin'
      };

      return res.status(200).json({
        admin: adminUser,
        token,
      });
    } else {
      return res.status(401).json({ error: 'invalid credentials' });
    }
  } catch (error) {
    console.error('admin login error:', error);
    return res.status(500).json({ error: 'login failed' });
  }
};

// get all users for admin dashboard
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'photo', 'status', 'createdAt'],
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

    await User.update({ status: 'approved' }, {
      where: { id: parseInt(id) }
    });
    
    const user = await User.findByPk(parseInt(id), {
      attributes: ['id', 'name', 'email', 'status']
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

// create email template
export const createTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'name, subject, and body are required' });
    }

    const template = await EmailTemplate.create({
      name,
      subject,
      body,
    });

    return res.status(201).json({
      message: 'template created successfully',
      template,
    });
  } catch (error) {
    console.error('create template error:', error);
    return res.status(500).json({ error: 'failed to create template' });
  }
};

// get all templates for admin dashboard
export const getAllTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ templates });
  } catch (error) {
    console.error('get templates error:', error);
    return res.status(500).json({ error: 'failed to fetch templates' });
  }
};

// delete template by id
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    await EmailTemplate.destroy({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      message: 'template deleted successfully',
    });
  } catch (error) {
    console.error('delete template error:', error);
    return res.status(500).json({ error: 'failed to delete template' });
  }
};

