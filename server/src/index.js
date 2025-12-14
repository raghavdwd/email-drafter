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
    const url = new URL(process.env.FRONTEND_URL);
    const hostname = url.hostname;
    
    // Only set domain if it's a proper domain (not localhost or IP)
    // For same root domain (e.g., app.example.com and api.example.com)
    // you might want to set domain to '.example.com'
    // For now, we'll let the browser handle it automatically
    return undefined;
  } catch (e) {
    return undefined;
  }
};

app.use(session({
  name: "connect.sid",
  secret: process.env.JWT_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  cookie: {
    httpOnly: true,
    secure: isProduction, // Requires HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' requires secure: true
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
