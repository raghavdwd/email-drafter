import jwt from 'jsonwebtoken';

// middleware to verify jwt token for protected routes
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // bearer token
    
    if (!token) {
      return res.status(401).json({ error: 'no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
};

// middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'admin access required' });
  }
  next();
};
