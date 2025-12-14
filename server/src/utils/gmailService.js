import { getGmailClient } from './gmailAuth.js';
import nodemailer from 'nodemailer';

/**
 * Create email message in RFC 2822 format using nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email text body
 * @param {string} html - Email html body
 * @param {Array} attachments - Array of attachment objects {filename, path}
 * @returns {Promise<string>} - Encoded email message
 */
const createEmailMessage = async (to, subject, text, html, attachments = []) => {
  const mailOptions = {
    to,
    subject,
    text,
    html,
  };

  // Add attachments if provided
  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

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
