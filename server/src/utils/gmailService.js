import { getGmailClient } from './gmailAuth.js';
import nodemailer from 'nodemailer';

/**
 * Create email message in RFC 2822 format using nodemailer with inline attachments
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email text body
 * @param {string} html - Email html body
 * @param {Array} attachments - Array of attachment objects with {filename, path, cid}
 * @returns {Promise<string>} - Encoded email message
 */
const createEmailMessage = async (to, subject, text, html, attachments = []) => {
  const mailOptions = {
    to,
    subject,
    text,
    html,
    attachments, // Inline attachments with CID
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
 * @param {Array} attachments - Optional inline attachments
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
 * Fetch image from URL and return as attachment object
 * @param {string} url - Image URL
 * @param {string} cid - Content ID for inline reference
 * @returns {Promise<Object>} - Attachment object
 */
const fetchImageAsAttachment = async (url, cid) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const filename = `image-${cid}.png`;
    
    return {
      filename,
      content: Buffer.from(buffer),
      cid, // Content-ID for inline reference
      contentDisposition: 'inline',
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

/**
 * Create multiple drafts in batch
 * @param {Object} user - User object with Gmail tokens
 * @param {Array} draftsData - Array of {to, subject, body, html, clientScreenshotUrl, competitorScreenshotUrl} objects
 * @returns {Promise<Array>} - Array of draft objects
 */
export const createDraftsInBatch = async (user, draftsData) => {
  const gmailClient = getGmailClient(user);
  const createdDrafts = [];

  for (const draftData of draftsData) {
    try {
      // Prepare inline attachments for images
      const attachments = [];
      let html = draftData.html;
      
      // Fetch and attach client screenshot if present
      if (draftData.clientScreenshotUrl) {
        const attachment = await fetchImageAsAttachment(draftData.clientScreenshotUrl, 'client-screenshot');
        if (attachment) {
          attachments.push(attachment);
          // Replace img src with cid reference
          html = html.replace(
            new RegExp(`src="${draftData.clientScreenshotUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
            `src="cid:client-screenshot"`
          );
        }
      }
      
      // Fetch and attach competitor screenshot if present
      if (draftData.competitorScreenshotUrl) {
        const attachment = await fetchImageAsAttachment(draftData.competitorScreenshotUrl, 'competitor-screenshot');
        if (attachment) {
          attachments.push(attachment);
          // Replace img src with cid reference
          html = html.replace(
            new RegExp(`src="${draftData.competitorScreenshotUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
            `src="cid:competitor-screenshot"`
          );
        }
      }
      
      const draft = await createDraft(
        gmailClient,
        draftData.to || '',
        draftData.subject,
        draftData.body,
        html,
        attachments
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
