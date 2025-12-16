import User from '../models/user.js';
import EmailTemplate from '../models/emailTemplate.js';
import TemplateVariable from '../models/templateVariable.js';
import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';

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
// delete a user by id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(parseInt(id));
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    await user.destroy();

    return res.status(200).json({
      message: 'user deleted successfully',
    });
  } catch (error) {
    console.error('delete user error:', error);
    return res.status(500).json({ error: 'failed to delete user' });
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

// update template by id
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body } = req.body;

    if (!name || !subject || !body) {
      return res.status(400).json({ error: 'name, subject, and body are required' });
    }

    const template = await EmailTemplate.findByPk(parseInt(id));

    if (!template) {
      return res.status(404).json({ error: 'template not found' });
    }

    template.name = name;
    template.subject = subject;
    template.body = body;
    await template.save();

    return res.status(200).json({
      message: 'template updated successfully',
      template,
    });
  } catch (error) {
    console.error('update template error:', error);
    return res.status(500).json({ error: 'failed to update template' });
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

// create template variable
export const createVariable = async (req, res) => {
  try {
    const { variableName, variableKey, variableType, description } = req.body;

    if (!variableName || !variableKey) {
      return res.status(400).json({ error: 'variableName and variableKey are required' });
    }

    // Check for duplicates
    const existingVariable = await TemplateVariable.findOne({
      where: {
        [Sequelize.Op.or]: [
          { variableName },
          { variableKey }
        ]
      }
    });

    if (existingVariable) {
      return res.status(409).json({ 
        error: 'A variable with this name or key already exists' 
      });
    }

    const variable = await TemplateVariable.create({
      variableName,
      variableKey,
      variableType: variableType || 'text',
      description: description || null,
    });

    return res.status(201).json({
      message: 'variable created successfully',
      variable,
    });
  } catch (error) {
    console.error('create variable error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: error.errors.map(e => e.message).join(', ')
      });
    }
    
    return res.status(500).json({ error: 'failed to create variable' });
  }
};

// get all template variables
export const getAllVariables = async (req, res) => {
  try {
    const variables = await TemplateVariable.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ variables });
  } catch (error) {
    console.error('get variables error:', error);
    return res.status(500).json({ error: 'failed to fetch variables' });
  }
};

// update template variable by id
export const updateVariable = async (req, res) => {
  try {
    const { id } = req.params;
    const { variableName, variableKey, variableType, description } = req.body;

    if (!variableName || !variableKey) {
      return res.status(400).json({ error: 'variableName and variableKey are required' });
    }

    const variable = await TemplateVariable.findByPk(parseInt(id));

    if (!variable) {
      return res.status(404).json({ error: 'variable not found' });
    }

    // Check for duplicates (excluding current variable)
    const existingVariable = await TemplateVariable.findOne({
      where: {
        id: { [Sequelize.Op.ne]: parseInt(id) },
        [Sequelize.Op.or]: [
          { variableName },
          { variableKey }
        ]
      }
    });

    if (existingVariable) {
      return res.status(409).json({ 
        error: 'A variable with this name or key already exists' 
      });
    }

    variable.variableName = variableName;
    variable.variableKey = variableKey;
    variable.variableType = variableType || 'text';
    variable.description = description || null;
    await variable.save();

    return res.status(200).json({
      message: 'variable updated successfully',
      variable,
    });
  } catch (error) {
    console.error('update variable error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: error.errors.map(e => e.message).join(', ')
      });
    }
    
    return res.status(500).json({ error: 'failed to update variable' });
  }
};

// delete template variable by id
export const deleteVariable = async (req, res) => {
  try {
    const { id } = req.params;

    const variable = await TemplateVariable.findByPk(parseInt(id));
    
    if (!variable) {
      return res.status(404).json({ error: 'variable not found' });
    }

    await variable.destroy();

    return res.status(200).json({
      message: 'variable deleted successfully',
    });
  } catch (error) {
    console.error('delete variable error:', error);
    return res.status(500).json({ error: 'failed to delete variable' });
  }
};

