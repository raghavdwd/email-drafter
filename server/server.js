import './src/config/env.js';
import express from 'express';
// import http from "http"; // Removed http module
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
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', emailRoutes);

// Create HTTP Server (optional, could just use app.listen)
// const server = http.createServer(app); // Removed http.createServer

// Sync database and start server
sequelize.sync({ alter: false })
  .then(() => {
    console.log('✓ Database synced successfully');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('✗ Database sync failed:', err);
  });
