import './src/config/env.js';
import express from 'express';
import cors from "cors";
import session from 'express-session';
import passport from 'passport';

// Routes
import authRoutes from "./src/routes/auth.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import emailRoutes from "./src/routes/email.route.js";

// Database and Config
import sequelize from './src/config/sequelize.js';
import './src/config/passport.js';
import './src/models/user.js';
import './src/models/emailTemplate.js';
import './src/models/uploadedRow.js';

const app = express();

// Middleware
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Debug: Log incoming cookies (optional in production)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('📨 Incoming request:', req.method, req.path);
    console.log('   Cookie header:', req.headers.cookie || 'NO COOKIES');
    next();
  });
}

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  name: "connect.sid",
  secret: process.env.JWT_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  proxy: isProduction,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
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
// No need to sync on every request - trust that schema is already created

// Export for Vercel serverless
export default app;
