import './config/env.js';
import express from 'express';
import cors from "cors";
import session from 'express-session';
import passport from 'passport';

// Routes
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import emailRoutes from "./routes/email.route.js";

// Database and Config
import sequelize from './config/sequelize.js';
import './config/passport.js';
import './models/user.js';
import './models/emailTemplate.js';
import './models/uploadedRow.js';

const app = express();

// Middleware
app.set('trust proxy', 1);

// CORS configuration - allow multiple origins in production if needed
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Debug: Log incoming cookies and outgoing Set-Cookie headers
app.use((req, res, next) => {
  // Log incoming cookies
  console.log('📨 Incoming request:', req.method, req.path);
  console.log('   Cookie header:', req.headers.cookie || 'NO COOKIES');
  console.log('   Origin:', req.headers.origin);
  
  // Intercept Set-Cookie headers to log them
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = function(name, value) {
    if (name.toLowerCase() === 'set-cookie') {
      console.log('🍪 Setting cookie:', value);
    }
    return originalSetHeader(name, value);
  };
  
  next();
});

const isProduction = process.env.NODE_ENV === 'production';

// Extract domain from FRONTEND_URL for cookie domain (if same root domain)
const getCookieDomain = () => {
  if (!isProduction || !process.env.FRONTEND_URL) return undefined;
  
  try {
    const frontendUrl = new URL(process.env.FRONTEND_URL);
    const backendUrl = process.env.BACKEND_URL ? new URL(process.env.BACKEND_URL) : null;
    
    // If frontend and backend are on the same domain, don't set domain
    // This allows cookie to work on the same domain
    if (backendUrl && frontendUrl.hostname === backendUrl.hostname) {
      return undefined; // Same domain, no need to set domain
    }
    
    // If different domains but same root (e.g., app.example.com and api.example.com)
    // Extract root domain
    const hostname = frontendUrl.hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // Return root domain with leading dot (e.g., '.example.com')
      return '.' + parts.slice(-2).join('.');
    }
    
    return undefined;
  } catch (e) {
    return undefined;
  }
};

// Determine if frontend and backend are on same domain
const isSameDomain = () => {
  if (!isProduction || !process.env.FRONTEND_URL || !process.env.BACKEND_URL) return false;
  try {
    const frontendUrl = new URL(process.env.FRONTEND_URL);
    const backendUrl = new URL(process.env.BACKEND_URL);
    return frontendUrl.hostname === backendUrl.hostname;
  } catch (e) {
    return false;
  }
};

// Use 'lax' for same domain, 'none' for cross-domain
const sameSiteValue = isProduction && !isSameDomain() ? 'none' : 'lax';

app.use(session({
  name: "connect.sid",
  secret: process.env.JWT_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  cookie: {
    httpOnly: true,
    secure: isProduction, // Requires HTTPS in production
    sameSite: sameSiteValue, // 'lax' for same domain, 'none' for cross-domain
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: getCookieDomain(), // Set if frontend/backend share root domain
    path: '/', // Explicitly set path to root
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', emailRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database connection for serverless
// Sequelize will automatically manage connections in serverless environment
// Database schema should be created via migrations, not auto-sync

// Export the Express app for Vercel
export default app;
