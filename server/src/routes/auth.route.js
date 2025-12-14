import express from "express";
import passport from "passport";
import {
  googleLogin,
  initiateGmailAuth,
  gmailCallback,
  checkGmailConnection,
  disconnectGmail,
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
  }),
  async (req, res) => {
    try {
      // Debug logging
      console.log('✓ OAuth callback successful');
      console.log('User:', req.user?.email);
      console.log('Session ID:', req.sessionID);
      console.log('Is Authenticated:', req.isAuthenticated());
      
      // Refresh user from database to get latest status
      // This ensures we have the most up-to-date approval status
      if (req.user && req.user.id) {
        const freshUser = await User.findByPk(req.user.id);
        
        if (!freshUser) {
          console.error('User not found in database');
          req.logout((err) => {
            if (err) console.error('Logout error:', err);
          });
          return res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/login?error=user_not_found");
        }
        
        // Update req.user with fresh data
        req.user = freshUser;
        
        // Check if user is pending approval
        if (freshUser.status === 'pending') {
          // Logout the user since they're not approved yet
          req.logout((err) => {
            if (err) console.error('Logout error:', err);
          });
          return res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/request-approval");
        }
        
        // User is approved - save session and redirect to dashboard
        // Session should auto-save on redirect, but we'll ensure it's saved
        req.session.save((err) => {
          if (err) {
            console.error('Session save error before redirect:', err);
          }
          // Redirect after session is saved
          res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/dashboard");
        });
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

router.get("/me", async (req, res) => {
  console.log('GET /auth/me - Session ID:', req.sessionID);
  console.log('GET /auth/me - Is Authenticated:', req.isAuthenticated());
  console.log('GET /auth/me - User:', req.user?.email);
  console.log('GET /auth/me - User ID:', req.user?.id);
  console.log('GET /auth/me - User Status:', req.user?.status);
  console.log('GET /auth/me - Cookies:', req.headers.cookie);
  
  if (req.isAuthenticated() && req.user) {
    try {
      // If user is a Sequelize instance, convert to plain object
      // Also refresh from database to ensure we have latest status
      let userData;
      
      if (req.user.id && typeof req.user.id === 'number') {
        // Regular user - refresh from database
        const freshUser = await User.findByPk(req.user.id, {
          attributes: ['id', 'name', 'email', 'photo', 'status', 'gmailConnected', 'createdAt']
        });
        
        if (!freshUser) {
          return res.status(401).json({ error: "user not found" });
        }
        
        // Convert Sequelize instance to plain object
        userData = freshUser.get({ plain: true });
      } else if (req.user.id === 'admin') {
        // Admin user - return as is
        userData = req.user;
      } else {
        // Fallback: try to convert current user object
        userData = req.user.get ? req.user.get({ plain: true }) : req.user;
      }
      
      return res.json({ user: userData });
    } catch (error) {
      console.error('Error in /auth/me:', error);
      return res.status(500).json({ error: "failed to fetch user data" });
    }
  }
  return res.status(401).json({ error: "no active session" });
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'logout failed' });
    }
    // Clear the session cookie
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destroy error:', destroyErr);
      }
      res.clearCookie('connect.sid');
      res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
    });
  });
});

// Gmail OAuth routes
router.get("/gmail", verifyToken, initiateGmailAuth);
router.get("/gmail/callback", gmailCallback);
router.get("/gmail/status", verifyToken, checkGmailConnection);
router.post("/gmail/disconnect", verifyToken, disconnectGmail);

export default router;
