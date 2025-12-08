import express from 'express';
import {
  adminLogin,
  getAllUsers,
  approveUser,
} from '../controllers/admin.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// admin login route (no auth required)
router.post('/login', adminLogin);

// protected admin routes
router.get('/users', verifyToken, verifyAdmin, getAllUsers);
router.put('/approve/:id', verifyToken, verifyAdmin, approveUser);

export default router;
