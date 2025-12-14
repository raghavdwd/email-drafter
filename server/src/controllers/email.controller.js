import UploadedRow from '../models/uploadedRow.js';
import EmailTemplate from '../models/emailTemplate.js';
import User from '../models/user.js';
import xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { replacePlaceholders, generateGmailDraftUrl } from '../utils/templateHelper.js';

/**
 * Upload Excel file and save rows to database
 */
export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // parse excel file from buffer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // convert to JSON
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    // validate required columns based on new template structure
    // Note: Only core fields are required, competitor data is optional
    const requiredColumns = [
      'Website',
      'Company Name',
      'Client Traffic',
      'Name',
      'Email',
    ];

    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        error: `Missing required columns: ${missingColumns.join(', ')}`,
      });
    }

    // generate unique fileId for this upload
    const fileId = uuidv4();

    // prepare rows for database
    const rows = data.map(row => ({
      fileId,
      firstName: row['Name']?.toString() || null,
      clientBusinessName: row['Company Name']?.toString() || null,
      clientTraffic: row['Client Traffic'] ? parseInt(row['Client Traffic']) : null,
      competitorName: row['Competitor Business Name 1']?.toString() || null,
      // Handle both "Competitor traffic 1" (lowercase) and "Competitor Traffic 1" (uppercase)
      competitorTraffic: row['Competitor traffic 1'] ? parseInt(row['Competitor traffic 1']) : (row['Competitor Traffic 1'] ? parseInt(row['Competitor Traffic 1']) : null),
      competitorWebsite: row['Competitor website 1']?.toString() || row['Competitor Website 1']?.toString() || null,
      competitorName2: row['Competitor Business Name 2']?.toString() || null,
      competitorTraffic2: row['Competitor Traffic 2'] ? parseInt(row['Competitor Traffic 2']) : null,
      competitorWebsite2: row['Competitor Website 2']?.toString() || null,
      calendarLink: null, // not in new template
      clientScreenshotUrl: row['Client Screenshot']?.toString() || null,
      competitorScreenshotUrl: row['Competitor Screenshot']?.toString() || null,
      sendingAccountName: row['Email']?.toString() || null,
      website: row['Website']?.toString() || null,
    }));

    // save all rows to database
    await UploadedRow.bulkCreate(rows);

    return res.status(200).json({
      fileId,
      count: rows.length,
    });
  } catch (error) {
    console.error('upload excel error:', error);
    console.error('error details:', error.message);
    console.error('error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to upload and parse Excel file',
      details: error.message 
    });
  }
};

/**
 * Get all templates for user dropdown
 */
export const getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.findAll({
      attributes: ['id', 'name', 'subject'],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ templates });
  } catch (error) {
    console.error('get templates error:', error);
    return res.status(500).json({ error: 'Failed to fetch templates', details: error.message });
  }
};

/**
 * Generate Gmail drafts using Gmail API
 */
export const generateDrafts = async (req, res) => {
  try {
    const { fileId, templateId } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!fileId || !templateId) {
      return res.status(400).json({ error: 'fileId and templateId are required' });
    }

    // fetch user with Gmail tokens
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // check if Gmail is connected
    if (!user.gmailConnected) {
      return res.status(400).json({ error: 'Please connect your Gmail account first' });
    }

    // check if token is expired and refresh if needed
    const { isTokenExpired, refreshAccessToken } = await import('../utils/gmailAuth.js');
    
    if (user.gmailTokenExpiry && isTokenExpired(user.gmailTokenExpiry)) {
      try {
        const newTokens = await refreshAccessToken(user.gmailRefreshToken);
        
        // update tokens in database
        await User.update({
          gmailAccessToken: newTokens.access_token,
          gmailTokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
        }, {
          where: { id: userId }
        });

        // update user object with new tokens
        user.gmailAccessToken = newTokens.access_token;
        user.gmailTokenExpiry = newTokens.expiry_date ? new Date(newTokens.expiry_date) : null;
      } catch (error) {
        console.error('token refresh error:', error);
        return res.status(401).json({ error: 'Failed to refresh Gmail token. Please reconnect your Gmail account.' });
      }
    }

    // fetch template
    const template = await EmailTemplate.findByPk(parseInt(templateId));

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // fetch all rows for this fileId
    const rows = await UploadedRow.findAll({
      where: { fileId },
      order: [['id', 'ASC']],
    });

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No rows found for this fileId' });
    }

    // create drafts using Gmail API
    const { createDraftsInBatch } = await import('../utils/gmailService.js');
    const { convertLink } = await import('../utils/linkConvert.js');

    // prepare drafts data
    const draftsData = rows.map((rowModel, index) => {
      // convert sequelize model to plain object
      const row = rowModel.get({ plain: true });
      
      // apply link conversion to screenshot URLs if present
      if (row.clientScreenshotUrl) {
        row.clientScreenshotUrl = convertLink(row.clientScreenshotUrl);
      }
      if (row.competitorScreenshotUrl) {
        row.competitorScreenshotUrl = convertLink(row.competitorScreenshotUrl);
      }

      const subject = replacePlaceholders(template.subject, row);
      const textBody = replacePlaceholders(template.body, row);
      
      // Simple text-to-HTML conversion: wrap paragraphs or replace newlines
      let htmlBody = `<div>${textBody.replace(/\n/g, '<br>')}</div>`;

      // Handle client screenshot embedding in HTML
      if (row.clientScreenshotUrl) {
        if (htmlBody.includes(row.clientScreenshotUrl)) {
          // Replace the URL text with the image tag
          htmlBody = htmlBody.replace(
            row.clientScreenshotUrl,
            `<br><img src="${row.clientScreenshotUrl}" alt="Client Screenshot" style="max-width: 100%; height: auto;"><br>`
          );
        } else {
          // Fallback: append if not found in body
          htmlBody += `<br><br><img src="${row.clientScreenshotUrl}" alt="Client Screenshot" style="max-width: 100%; height: auto;">`;
        }
      }

      // Handle competitor screenshot embedding in HTML
      if (row.competitorScreenshotUrl) {
        if (htmlBody.includes(row.competitorScreenshotUrl)) {
          // Replace the URL text with the image tag
          htmlBody = htmlBody.replace(
            row.competitorScreenshotUrl,
            `<br><img src="${row.competitorScreenshotUrl}" alt="Competitor Screenshot" style="max-width: 100%; height: auto;"><br>`
          );
        } else {
          // Fallback: append if not found in body
          htmlBody += `<br><br><img src="${row.competitorScreenshotUrl}" alt="Competitor Screenshot" style="max-width: 100%; height: auto;">`;
        }
      }

      // Build attachments array for screenshots
      const attachments = [];
      
      if (row.clientScreenshotUrl) {
        attachments.push({
          filename: 'client-screenshot.png',
          path: row.clientScreenshotUrl
        });
      }
      
      if (row.competitorScreenshotUrl) {
        attachments.push({
          filename: 'competitor-screenshot.png',
          path: row.competitorScreenshotUrl
        });
      }

      return {
        row: index + 1,
        to: row.sendingAccountName || '', // Auto-populate recipient email from Excel
        subject,
        body: '', // Keep body empty as requested by user to only send HTML
        html: htmlBody,
        attachments,
      };
    });

    // create drafts using Gmail API
    // const { createDraftsInBatch } = await import('../utils/gmailService.js');
    const createdDrafts = await createDraftsInBatch(user, draftsData);

    // count successful vs failed
    const successCount = createdDrafts.filter(d => d.success).length;
    const failCount = createdDrafts.filter(d => !d.success).length;

    return res.status(200).json({
      message: `Created ${successCount} drafts successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      drafts: createdDrafts,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error('generate drafts error:', error);
    return res.status(500).json({ error: 'Failed to generate draft emails' });
  }
};


