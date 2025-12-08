import express from 'express';
import { googleLogin } from '../controllers/auth.controller.js';

const router = express.Router();

// user authentication routes
router.post('/google', googleLogin);

export default router;
