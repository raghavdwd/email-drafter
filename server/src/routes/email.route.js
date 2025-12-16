import express from 'express';
import { 
  uploadExcel, 
  getTemplates,
  getAllTemplatesForUser,
  getVariablesForUser,
  generateDrafts,
  scheduleEmails,
  sendEmailsNow,
  getScheduledJobs,
  pauseScheduledJob,
  resumeScheduledJob,
  cancelScheduledJob,
  getSentEmails,
  deleteSentEmails,
  getUploadedFiles,
  validateTemplateMapping
} from '../controllers/email.controller.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// upload excel file (requires auth)
router.post('/upload', verifyToken, uploadMiddleware.single('file'), uploadExcel);

// get templates for dropdown (requires auth)
router.get('/templates', verifyToken, getTemplates);

// generate gmail drafts (requires auth)
router.post('/email/draft', verifyToken, generateDrafts);

// Schedule emails with time interval (requires auth)
router.post('/email/schedule', verifyToken, scheduleEmails);

// Send emails immediately with time interval (requires auth)
router.post('/email/send-now', verifyToken, sendEmailsNow);

// Get scheduled jobs (requires auth)
router.get('/email/scheduled', verifyToken, getScheduledJobs);

// Pause a scheduled job (requires auth)
router.put('/email/scheduled/:id/pause', verifyToken, pauseScheduledJob);

// Resume a scheduled job (requires auth)
router.put('/email/scheduled/:id/resume', verifyToken, resumeScheduledJob);

// Cancel a scheduled job (requires auth)
router.delete('/email/scheduled/:id', verifyToken, cancelScheduledJob);

// Get sent emails history (requires auth)
router.get('/email/sent', verifyToken, getSentEmails);

// Delete sent emails history (requires auth)
router.delete('/email/history', verifyToken, deleteSentEmails);

// Get uploaded files history (requires auth)
router.get('/email/uploads', verifyToken, getUploadedFiles);

// Validate template variable mapping with Excel data
router.get('/template/validate', verifyToken, validateTemplateMapping);

// Get all templates with full details for users (Variables Guide)
router.get('/templates/all', verifyToken, getAllTemplatesForUser);

// Get all variables for users (Variables Guide)
router.get('/variables', verifyToken, getVariablesForUser);

export default router;