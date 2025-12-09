import jwt from 'jsonwebtoken';

// middleware to verify jwt token for protected routes
// middleware to verify session for protected routes
export const verifyToken = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'unauthorized: please login' });
};

// middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'admin access required' });
  }
  next();
};
