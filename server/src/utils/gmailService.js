import { getGmailClient } from './gmailAuth.js';

/**
 * Create email message in RFC 2822 format
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {string} - Encoded email message
 */
const createEmailMessage = (to, subject, body) => {
  const message = [
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n');

  // Encode message in base64url format
  const encodedMessage = Buffer.from(message)
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
 * @param {string} body - Email body
 * @returns {Promise<Object>} - Draft object with id
 */
export const createDraft = async (gmailClient, to, subject, body) => {
  const encodedMessage = createEmailMessage(to, subject, body);

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
 * @param {Array} draftsData - Array of {to, subject, body} objects
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
        draftData.body
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
