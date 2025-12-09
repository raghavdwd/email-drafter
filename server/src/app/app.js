import '../../src/config/env.js';

import express from "express";
import cors from "cors";
import authRoutes from "../routes/auth.route.js";
import adminRoutes from "../routes/admin.route.js";
import emailRoutes from "../routes/email.route.js";

import session from 'express-session';
import passport from 'passport';
import '../config/passport.js';

const app = express();

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

// creating server routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', emailRoutes);

export default app;