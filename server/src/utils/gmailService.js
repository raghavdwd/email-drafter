import { getGmailClient } from './gmailAuth.js';
import nodemailer from 'nodemailer';

/**
 * Create email message in RFC 2822 format using nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email text body
 * @param {string} html - Email html body
 * @returns {Promise<string>} - Encoded email message
 */
const createEmailMessage = async (to, subject, text, html) => {
  const mailOptions = {
    to,
    subject,
    text,
    html,
  };

  // Create a MailComposer instance
  // Note: nodemailer exports MailComposer via the main package but sometimes it's easier to use a dummy transport or just MailComposer directly if available.
  // Using a stream transport to generate the raw content.
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
 * @returns {Promise<Object>} - Draft object with id
 */
export const createDraft = async (gmailClient, to, subject, body, html) => {
  const encodedMessage = await createEmailMessage(to, subject, body, html);

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
 * @param {Array} draftsData - Array of {to, subject, body, html} objects
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
        draftData.html
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
