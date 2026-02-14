import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  googleLogin,
  initiateGmailAuth,
  gmailCallback,
  checkGmailConnection,
  disconnectGmail,
  preAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import User from "../models/user.js";

const router = express.Router();

// user authentication routes
// POST route for Google ID Token authentication (alternative method)
router.post("/google", googleLogin);

// GET route for Google OAuth flow (Passport.js session-based)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: (process.env.FRONTEND_URL || "http://localhost:5173") + "/login?error=auth_failed",
    session: false, // Disable session for JWT
  }),
  async (req, res) => {
    try {
      // Debug logging
      console.log('✓ OAuth callback successful');
      console.log('User:', req.user?.email);
      
      // Refresh user from database to get latest status
      if (req.user && req.user.id) {
        const freshUser = await User.findByPk(req.user.id);
        
        if (!freshUser) {
          console.error('User not found in database');
          return res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/login?error=user_not_found");
        }
        
        // Check if user is pending approval
        if (freshUser.status === 'pending') {
          return res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/request-approval");
        }
        
        // User is approved - generate JWT token
        const token = jwt.sign(
          {
            id: freshUser.id,
            email: freshUser.email,
            role: 'user',
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        // Redirect to frontend with token in URL (frontend will extract and store it)
        const redirectUrl = (process.env.FRONTEND_URL || "http://localhost:5173") + `/dashboard?token=${token}`;
        console.log('Redirecting to dashboard with token');
        res.redirect(redirectUrl);
      } else {
        console.error('No user in request after authentication');
        res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/login?error=no_user");
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/login?error=callback_failed");
    }
  }
);

router.get("/me", verifyToken, async (req, res) => {
  try {
    // User is already verified by verifyToken middleware
    // req.user is set by the middleware
    
    // If admin user, return admin object directly
    if (req.user.id === 'admin' && req.user.role === 'admin') {
      return res.json({ user: req.user });
    }
    
    // For regular users, fetch from database
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'photo', 'status', 'gmailConnected', 'createdAt']
    });
    
    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }
    
    const userData = user.get({ plain: true });
    return res.json({ user: userData });
  } catch (error) {
    console.error('Error in /auth/me:', error);
    return res.status(500).json({ error: "failed to fetch user data" });
  }
});

router.get("/logout", (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  // This endpoint just confirms logout
  res.json({ message: 'logged out successfully' });
});

// Test endpoint to check JWT token
router.get("/test-token", verifyToken, (req, res) => {
  res.json({
    user: req.user,
    tokenValid: true
  });
});

// Gmail OAuth routes
router.get("/gmail", verifyToken, initiateGmailAuth);
router.get("/gmail/callback", gmailCallback);
router.get("/gmail/status", verifyToken, checkGmailConnection);
router.post("/gmail/disconnect", verifyToken, disconnectGmail);

// Pre-authentication route
router.post("/pre-auth", preAuth);

export default router;
