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
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use(session({
  name: "connect.sid", // explicit name helps debugging
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true, //  REQUIRED in prod behind proxy
  cookie: {
    httpOnly: true,
    secure: true,          // MUST be true in prod
    sameSite: "none",      // REQUIRED for Google OAuth
    maxAge: 24 * 60 * 60 * 1000
  }
}));


app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', emailRoutes);

//health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
