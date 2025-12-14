import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// middleware to verify jwt token for protected routes
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header or query parameter
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: 'unauthorized: no token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If admin token, set user directly
    if (decoded.id === 'admin' && decoded.role === 'admin') {
      req.user = {
        id: 'admin',
        email: decoded.email,
        role: 'admin'
      };
      return next();
    }
    
    // For regular users, fetch from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized: user not found' });
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'unauthorized: invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'unauthorized: token expired' });
    }
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'internal server error' });
  }
};

// middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'admin access required' });
  }
  next();
};
