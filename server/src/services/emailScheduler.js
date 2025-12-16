import ScheduledEmail from '../models/scheduledEmail.js';
import SentEmail from '../models/sentEmail.js';
import User from '../models/user.js';
import UploadedRow from '../models/uploadedRow.js';
import EmailTemplate from '../models/emailTemplate.js';
import { sendEmailsWithInterval, pauseScheduledSend, resumeScheduledSend, cancelScheduledSend } from '../utils/gmailService.js';
import { replacePlaceholders } from '../utils/templateHelper.js';
import { convertLink } from '../utils/linkConvert.js';

/**
 * Email Scheduler Service
 * Manages scheduled email sending jobs
 */

/**
 * Create and start a scheduled email job
 * @param {number} userId - User ID
 * @param {string} fileId - File ID for uploaded rows
 * @param {number} templateId - Template ID
 * @param {number} intervalSeconds - Interval between emails in seconds
 * @param {boolean} startImmediately - Whether to start sending immediately
 * @returns {Promise<Object>} - Created scheduled email job
 */
export const createScheduledJob = async (userId, fileId, templateId, intervalSeconds, startImmediately = true) => {
  // Fetch rows for this file
  const rows = await UploadedRow.findAll({
    where: { fileId },
    order: [['id', 'ASC']],
  });

  if (rows.length === 0) {
    throw new Error('No rows found for this fileId');
  }

  // Create scheduled email record
  const scheduledEmail = await ScheduledEmail.create({
    userId,
    fileId,
    templateId,
    status: 'pending',
    timeIntervalSeconds: intervalSeconds,
    currentIndex: 0,
    totalCount: rows.length,
  });

  // If startImmediately, start the job
  if (startImmediately) {
    // Don't await - run in background
    startScheduledJob(scheduledEmail.id).catch(err => {
      console.error(`Error starting scheduled job ${scheduledEmail.id}:`, err);
    });
  }

  return scheduledEmail;
};

/**
 * Start sending emails for a scheduled job
 * @param {number} scheduledEmailId - Scheduled email job ID
 * @returns {Promise<void>}
 */
export const startScheduledJob = async (scheduledEmailId) => {
  // Fetch scheduled email
  const scheduledEmail = await ScheduledEmail.findByPk(scheduledEmailId);
  
  if (!scheduledEmail) {
    throw new Error('Scheduled email not found');
  }

  if (scheduledEmail.status === 'completed' || scheduledEmail.status === 'cancelled') {
    throw new Error(`Cannot start job with status: ${scheduledEmail.status}`);
  }

  // Fetch user
  const user = await User.findByPk(scheduledEmail.userId);
  if (!user || !user.gmailConnected) {
    throw new Error('User not found or Gmail not connected');
  }

  // Fetch template
  const template = await EmailTemplate.findByPk(scheduledEmail.templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  // Fetch rows
  const rows = await UploadedRow.findAll({
    where: { fileId: scheduledEmail.fileId },
    order: [['id', 'ASC']],
  });

  // Update status to in_progress
  await scheduledEmail.update({
    status: 'in_progress',
    startedAt: scheduledEmail.startedAt || new Date(),
  });

  // Prepare emails data
  const emailsData = await Promise.all(rows.map(async (rowModel, index) => {
    const row = rowModel.get({ plain: true });
    
    // Apply link conversion to screenshot URLs if present
    if (row.clientScreenshotUrl) {
      row.clientScreenshotUrl = convertLink(row.clientScreenshotUrl);
    }
    if (row.competitorScreenshotUrl) {
      row.competitorScreenshotUrl = convertLink(row.competitorScreenshotUrl);
    }

    const subject = replacePlaceholders(template.subject, row);
    const textBody = replacePlaceholders(template.body, row);
    
    // Prepare attachments array for inline images
    const attachments = [];
    let htmlBody = textBody.replace(/\n/g, '<br>');
    
    // Fetch and attach client screenshot if present
    if (row.clientScreenshotUrl) {
      try {
        const response = await fetch(row.clientScreenshotUrl);
        if (response.ok) {
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          const cid = `client_screenshot_${index}@email`;
          
          attachments.push({
            filename: 'image.png',
            content: imageBuffer,
            cid: cid,
            contentDisposition: 'inline'
          });
          
          const imgTag = `<div style="margin: 20px 0;"><img src="cid:${cid}" alt="Client Screenshot" style="max-width: 600px; width: 100%; height: auto; display: block; border: 1px solid #ddd; border-radius: 4px;"></div>`;
          
          if (htmlBody.includes(row.clientScreenshotUrl)) {
            htmlBody = htmlBody.replace(row.clientScreenshotUrl, imgTag);
          } else {
            htmlBody += imgTag;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch client screenshot for row ${index + 1}:`, error.message);
      }
    }

    // Fetch and attach competitor screenshot if present
    if (row.competitorScreenshotUrl) {
      try {
        const response = await fetch(row.competitorScreenshotUrl);
        if (response.ok) {
          const imageBuffer = Buffer.from(await response.arrayBuffer());
          const cid = `competitor_screenshot_${index}@email`;
          
          attachments.push({
            filename: 'competitor-screenshot.png',
            content: imageBuffer,
            cid: cid,
            contentDisposition: 'inline'
          });
          
          const imgTag = `<div style="margin: 20px 0;"><img src="cid:${cid}" alt="Competitor Screenshot" style="max-width: 600px; width: 100%; height: auto; display: block; border: 1px solid #ddd; border-radius: 4px;"></div>`;
          
          if (htmlBody.includes(row.competitorScreenshotUrl)) {
            htmlBody = htmlBody.replace(row.competitorScreenshotUrl, imgTag);
          } else {
            htmlBody += imgTag;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch competitor screenshot for row ${index + 1}:`, error.message);
      }
    }
    
    // Wrap in a proper HTML structure
    const finalHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
  ${htmlBody}
</body>
</html>
    `.trim();

    return {
      row: index + 1,
      rowId: row.id,
      to: row.sendingAccountName || '',
      subject,
      body: '',
      html: finalHtml,
      attachments,
    };
  }));

  // Progress callback
  const onProgress = async (index, result) => {
    // Save sent email record
    await SentEmail.create({
      scheduledEmailId: scheduledEmail.id,
      userId: scheduledEmail.userId,
      rowId: result.rowId,
      recipientEmail: result.recipientEmail,
      subject: result.subject,
      status: result.status,
      messageId: result.messageId || null,
      error: result.error || null,
      sentAt: new Date(),
    });

    // Update scheduled email progress
    await scheduledEmail.update({
      currentIndex: index + 1,
    });

    // If this was the last email, mark as completed
    if (index + 1 >= scheduledEmail.totalCount) {
      await scheduledEmail.update({
        status: 'completed',
        completedAt: new Date(),
      });
    }
  };

  // Start sending emails with interval
  try {
    await sendEmailsWithInterval(
      user,
      emailsData,
      scheduledEmail.timeIntervalSeconds,
      scheduledEmail.id,
      onProgress,
      scheduledEmail.currentIndex
    );

    // Check final status (might have been cancelled)
    const finalScheduledEmail = await ScheduledEmail.findByPk(scheduledEmailId);
    if (finalScheduledEmail.status === 'in_progress') {
      await finalScheduledEmail.update({
        status: 'completed',
        completedAt: new Date(),
      });
    }
  } catch (error) {
    console.error(`Error in scheduled job ${scheduledEmailId}:`, error);
    await scheduledEmail.update({
      status: 'failed',
    });
    throw error;
  }
};

/**
 * Pause a scheduled job
 * @param {number} scheduledEmailId - Scheduled email job ID
 * @returns {Promise<Object>} - Updated scheduled email
 */
export const pauseJob = async (scheduledEmailId) => {
  const scheduledEmail = await ScheduledEmail.findByPk(scheduledEmailId);
  
  if (!scheduledEmail) {
    throw new Error('Scheduled email not found');
  }

  if (scheduledEmail.status !== 'in_progress') {
    throw new Error('Can only pause jobs that are in progress');
  }

  // Pause the job in gmailService
  const paused = pauseScheduledSend(scheduledEmailId);
  
  if (!paused) {
    throw new Error('Job is not currently active');
  }

  // Update status
  await scheduledEmail.update({
    status: 'paused',
  });

  return scheduledEmail;
};

/**
 * Resume a paused job
 * @param {number} scheduledEmailId - Scheduled email job ID
 * @returns {Promise<Object>} - Updated scheduled email
 */
export const resumeJob = async (scheduledEmailId) => {
  const scheduledEmail = await ScheduledEmail.findByPk(scheduledEmailId);
  
  if (!scheduledEmail) {
    throw new Error('Scheduled email not found');
  }

  if (scheduledEmail.status !== 'paused') {
    throw new Error('Can only resume paused jobs');
  }

  // Resume the job in gmailService
  const resumed = resumeScheduledSend(scheduledEmailId);
  
  if (!resumed) {
    throw new Error('Job is not currently active');
  }

  // Update status
  await scheduledEmail.update({
    status: 'in_progress',
  });

  return scheduledEmail;
};

/**
 * Cancel a scheduled job
 * @param {number} scheduledEmailId - Scheduled email job ID
 * @returns {Promise<Object>} - Updated scheduled email
 */
export const cancelJob = async (scheduledEmailId) => {
  const scheduledEmail = await ScheduledEmail.findByPk(scheduledEmailId);
  
  if (!scheduledEmail) {
    throw new Error('Scheduled email not found');
  }

  if (scheduledEmail.status === 'completed' || scheduledEmail.status === 'cancelled') {
    throw new Error(`Cannot cancel job with status: ${scheduledEmail.status}`);
  }

  // Cancel the job in gmailService
  cancelScheduledSend(scheduledEmailId);

  // Update status
  await scheduledEmail.update({
    status: 'cancelled',
    completedAt: new Date(),
  });

  return scheduledEmail;
};

/**
 * Get all scheduled jobs for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of scheduled email jobs
 */
export const getActiveJobs = async (userId) => {
  const jobs = await ScheduledEmail.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });

  return jobs;
};

/**
 * Get sent emails for a scheduled job or user
 * @param {number} userId - User ID
 * @param {number} scheduledEmailId - Optional scheduled email job ID
 * @returns {Promise<Array>} - Array of sent emails
 */
export const getSentEmailsHistory = async (userId, scheduledEmailId = null) => {
  const where = { userId };
  
  if (scheduledEmailId) {
    where.scheduledEmailId = scheduledEmailId;
  }

  const sentEmails = await SentEmail.findAll({
    where,
    order: [['sentAt', 'DESC']],
  });

  return sentEmails;
};
