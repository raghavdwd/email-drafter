import express from 'express';
import { uploadExcel, getTemplates, generateDrafts } from '../controllers/email.controller.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// upload excel file (requires auth)
router.post('/upload', verifyToken, uploadMiddleware.single('file'), uploadExcel);

// get templates for dropdown (requires auth)
router.get('/templates', verifyToken, getTemplates);

// generate gmail drafts (requires auth)
router.post('/email/draft', verifyToken, generateDrafts);

export default router;