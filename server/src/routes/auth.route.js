import express from "express";
import passport from "passport";
import {
  initiateGmailAuth,
  gmailCallback,
  checkGmailConnection,
  disconnectGmail,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// user authentication routes
// user authentication routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: (process.env.FRONTEND_URL || "http://localhost:5173") + "/login",
  }),
  (req, res) => {
    // Debug logging
    console.log('✓ OAuth callback successful');
    console.log('User:', req.user?.email);
    console.log('Session ID:', req.sessionID);
    console.log('Is Authenticated:', req.isAuthenticated());
    
    // Successful authentication, redirect home.
    res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/dashboard");
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
      return next(err);
    }
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  });
});

// Gmail OAuth routes
router.get("/gmail", verifyToken, initiateGmailAuth);
router.get("/gmail/callback", gmailCallback);
router.get("/gmail/status", verifyToken, checkGmailConnection);
router.post("/gmail/disconnect", verifyToken, disconnectGmail);

export default router;
