import { getGmailClient } from './gmailAuth.js';
import nodemailer from 'nodemailer';

/**
 * Create email message in RFC 2822 format using nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email text body
 * @param {string} html - Email html body
 * @param {Array} attachments - Array of attachment objects with cid and content
 * @returns {Promise<string>} - Encoded email message
 */
const createEmailMessage = async (to, subject, text, html, attachments = []) => {
  const mailOptions = {
    to,
    subject,
    text,
    html,
    attachments, // Inline attachments for images
  };

  // Create a MailComposer instance
  const transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  });

  const info = await transporter.sendMail(mailOptions);
  
  // info.message is the raw buffer/string
  // We need to base64url encode it for Gmail API
  const encodedMessage = info.message
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encodedMessage;
};

/**
 * Create a single draft in Gmail
 * @param {Object} gmailClient - Authenticated Gmail client
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} body - Email body (text)
 * @param {string} html - Email body (html)
 * @param {Array} attachments - Array of attachment objects
 * @returns {Promise<Object>} - Draft object with id
 */
export const createDraft = async (gmailClient, to, subject, body, html, attachments = []) => {
  const encodedMessage = await createEmailMessage(to, subject, body, html, attachments);

  const res = await gmailClient.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw: encodedMessage,
      },
    },
  });

  return res.data;
};

/**
 * Create multiple drafts in batch
 * @param {Object} user - User object with Gmail tokens
 * @param {Array} draftsData - Array of {to, subject, body, html, attachments} objects
 * @returns {Promise<Array>} - Array of draft objects
 */
export const createDraftsInBatch = async (user, draftsData) => {
  const gmailClient = getGmailClient(user);
  const createdDrafts = [];

  for (const draftData of draftsData) {
    try {
      const draft = await createDraft(
        gmailClient,
        draftData.to || '',
        draftData.subject,
        draftData.body,
        draftData.html,
        draftData.attachments || []
      );
      createdDrafts.push({
        row: draftData.row,
        draftId: draft.id,
        success: true,
      });
    } catch (error) {
      console.error(`Error creating draft for row ${draftData.row}:`, error.message);
      createdDrafts.push({
        row: draftData.row,
        error: error.message,
        success: false,
      });
    }
  }

  return createdDrafts;
};

/**
 * Send a single email using Gmail API
 * @param {Object} gmailClient - Authenticated Gmail client
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} body - Email body (text)
 * @param {string} html - Email body (html)
 * @param {Array} attachments - Array of attachment objects
 * @returns {Promise<Object>} - Sent message object with id
 */
export const sendEmail = async (gmailClient, to, subject, body, html, attachments = []) => {
  const encodedMessage = await createEmailMessage(to, subject, body, html, attachments);

  const res = await gmailClient.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return res.data;
};

// Store for active scheduled jobs (in-memory)
const activeJobs = new Map();

/**
 * Send emails with time interval, supporting pause/cancel
 * @param {Object} user - User object with Gmail tokens
 * @param {Array} emailsData - Array of {row, rowId, to, subject, body, html, attachments} objects
 * @param {number} intervalSeconds - Time interval between emails in seconds
 * @param {number} scheduledEmailId - ID of the scheduled email job
 * @param {Function} onProgress - Callback after each email: (index, result) => Promise<void>
 * @param {number} startIndex - Index to start from (for resume functionality)
 * @returns {Promise<void>}
 */
export const sendEmailsWithInterval = async (
  user,
  emailsData,
  intervalSeconds,
  scheduledEmailId,
  onProgress,
  startIndex = 0
) => {
  const gmailClient = getGmailClient(user);
  
  // Create job control object
  const jobControl = {
    paused: false,
    cancelled: false,
    currentIndex: startIndex,
  };
  
  activeJobs.set(scheduledEmailId, jobControl);

  try {
    for (let i = startIndex; i < emailsData.length; i++) {
      // Check if job was cancelled
      if (jobControl.cancelled) {
        console.log(`Job ${scheduledEmailId} was cancelled at index ${i}`);
        break;
      }

      // Wait while paused
      while (jobControl.paused && !jobControl.cancelled) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Check again after pause in case it was cancelled
      if (jobControl.cancelled) {
        console.log(`Job ${scheduledEmailId} was cancelled at index ${i}`);
        break;
      }

      const emailData = emailsData[i];
      let result;

      try {
        const sentMessage = await sendEmail(
          gmailClient,
          emailData.to || '',
          emailData.subject,
          emailData.body,
          emailData.html,
          emailData.attachments || []
        );

        result = {
          row: emailData.row,
          rowId: emailData.rowId,
          recipientEmail: emailData.to,
          subject: emailData.subject,
          messageId: sentMessage.id,
          status: 'sent',
          success: true,
        };
      } catch (error) {
        console.error(`Error sending email for row ${emailData.row}:`, error.message);
        result = {
          row: emailData.row,
          rowId: emailData.rowId,
          recipientEmail: emailData.to,
          subject: emailData.subject,
          error: error.message,
          status: 'failed',
          success: false,
        };
      }

      // Update current index
      jobControl.currentIndex = i + 1;

      // Notify progress
      if (onProgress) {
        await onProgress(i, result);
      }

      // Wait interval before next email (unless it's the last one)
      if (i < emailsData.length - 1 && !jobControl.cancelled) {
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
      }
    }
  } finally {
    // Clean up
    activeJobs.delete(scheduledEmailId);
  }
};

/**
 * Pause a scheduled email job
 * @param {number} scheduledEmailId - ID of the scheduled email job
 * @returns {boolean} - True if successfully paused, false if job not found
 */
export const pauseScheduledSend = (scheduledEmailId) => {
  const jobControl = activeJobs.get(scheduledEmailId);
  if (jobControl) {
    jobControl.paused = true;
    return true;
  }
  return false;
};

/**
 * Resume a paused scheduled email job
 * @param {number} scheduledEmailId - ID of the scheduled email job
 * @returns {boolean} - True if successfully resumed, false if job not found
 */
export const resumeScheduledSend = (scheduledEmailId) => {
  const jobControl = activeJobs.get(scheduledEmailId);
  if (jobControl) {
    jobControl.paused = false;
    return true;
  }
  return false;
};

/**
 * Cancel a scheduled email job
 * @param {number} scheduledEmailId - ID of the scheduled email job
 * @returns {boolean} - True if successfully cancelled, false if job not found
 */
export const cancelScheduledSend = (scheduledEmailId) => {
  const jobControl = activeJobs.get(scheduledEmailId);
  if (jobControl) {
    jobControl.cancelled = true;
    return true;
  }
  return false;
};


/**
 * Check if a job is currently active
 * @param {number} scheduledEmailId - ID of the scheduled email job
 * @returns {boolean} - True if job is active
 */
export const isJobActive = (scheduledEmailId) => {
  return activeJobs.has(scheduledEmailId);
};

/**
 * Delete messages from Gmail (batch delete)
 * @param {Object} gmailClient - Authenticated Gmail client
 * @param {Array<string>} messageIds - Array of message IDs to delete
 * @returns {Promise<void>}
 */
export const deleteMessages = async (gmailClient, messageIds) => {
  if (!messageIds || messageIds.length === 0) return;
  
  await gmailClient.users.messages.batchDelete({
    userId: 'me',
    requestBody: {
      ids: messageIds
    }
  });
};

