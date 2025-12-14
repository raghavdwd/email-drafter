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
      
      // Check if user is pending approval
      if (req.user && req.user.status === 'pending') {
        // Logout the user since they're not approved yet
        req.logout((err) => {
          if (err) console.error('Logout error:', err);
        });
        return res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/request-approval");
      }
      
      // User is approved, redirect to dashboard
      res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/dashboard");
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/login?error=callback_failed");
    }
  }
);

router.get("/me", (req, res) => {
  console.log('GET /auth/me - Session ID:', req.sessionID);
  console.log('GET /auth/me - Is Authenticated:', req.isAuthenticated());
  console.log('GET /auth/me - User:', req.user?.email);
  
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
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
