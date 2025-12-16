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

    // prepare drafts data with inline image attachments
    const draftsData = await Promise.all(rows.map(async (rowModel, index) => {
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
            
            // Reference image in HTML using CID
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
            
            // Reference image in HTML using CID
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
        to: row.sendingAccountName || '', // Auto-populate recipient email from Excel
        subject,
        body: '', // Keep body empty to use HTML only
        html: finalHtml,
        attachments, // Include inline image attachments
      };
    }));

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


/**
 * Schedule emails to be sent with time interval
 */
export const scheduleEmails = async (req, res) => {
  try {
    const { fileId, templateId, intervalSeconds } = req.body;
    const userId = req.user.id;

    if (!fileId || !templateId || !intervalSeconds) {
      return res.status(400).json({ error: 'fileId, templateId, and intervalSeconds are required' });
    }

    if (intervalSeconds < 10) {
      return res.status(400).json({ error: 'Minimum interval is 10 seconds' });
    }

    // Import scheduler service
    const { createScheduledJob } = await import('../services/emailScheduler.js');

    // Create and start the scheduled job
    const scheduledEmail = await createScheduledJob(userId, fileId, templateId, intervalSeconds, true);

    return res.status(200).json({
      message: 'Email sending scheduled successfully',
      scheduledEmailId: scheduledEmail.id,
      totalCount: scheduledEmail.totalCount,
      intervalSeconds: scheduledEmail.timeIntervalSeconds,
    });
  } catch (error) {
    console.error('schedule emails error:', error);
    return res.status(500).json({ error: error.message || 'Failed to schedule emails' });
  }
};

/**
 * Send emails immediately with time interval
 */
export const sendEmailsNow = async (req, res) => {
  try {
    const { fileId, templateId, intervalSeconds } = req.body;
    const userId = req.user.id;

    if (!fileId || !templateId || !intervalSeconds) {
      return res.status(400).json({ error: 'fileId, templateId, and intervalSeconds are required' });
    }

    if (intervalSeconds < 10) {
      return res.status(400).json({ error: 'Minimum interval is 10 seconds' });
    }

    // Import scheduler service
    const { createScheduledJob } = await import('../services/emailScheduler.js');

    // Create and start the scheduled job immediately
    const scheduledEmail = await createScheduledJob(userId, fileId, templateId, intervalSeconds, true);

    return res.status(200).json({
      message: 'Email sending started successfully',
      scheduledEmailId: scheduledEmail.id,
      totalCount: scheduledEmail.totalCount,
      intervalSeconds: scheduledEmail.timeIntervalSeconds,
    });
  } catch (error) {
    console.error('send emails now error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send emails' });
  }
};

/**
 * Get all scheduled jobs for the user
 */
export const getScheduledJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const { getActiveJobs } = await import('../services/emailScheduler.js');
    const jobs = await getActiveJobs(userId);

    return res.status(200).json({ jobs });
  } catch (error) {
    console.error('get scheduled jobs error:', error);
    return res.status(500).json({ error: 'Failed to fetch scheduled jobs' });
  }
};

/**
 * Pause a scheduled job
 */
export const pauseScheduledJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify job belongs to user
    const ScheduledEmail = (await import('../models/scheduledEmail.js')).default;
    const scheduledEmail = await ScheduledEmail.findByPk(id);

    if (!scheduledEmail) {
      return res.status(404).json({ error: 'Scheduled job not found' });
    }

    if (scheduledEmail.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { pauseJob } = await import('../services/emailScheduler.js');
    const updatedJob = await pauseJob(parseInt(id));

    return res.status(200).json({
      message: 'Job paused successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('pause scheduled job error:', error);
    return res.status(500).json({ error: error.message || 'Failed to pause job' });
  }
};

/**
 * Resume a paused scheduled job
 */
export const resumeScheduledJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify job belongs to user
    const ScheduledEmail = (await import('../models/scheduledEmail.js')).default;
    const scheduledEmail = await ScheduledEmail.findByPk(id);

    if (!scheduledEmail) {
      return res.status(404).json({ error: 'Scheduled job not found' });
    }

    if (scheduledEmail.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { resumeJob } = await import('../services/emailScheduler.js');
    const updatedJob = await resumeJob(parseInt(id));

    return res.status(200).json({
      message: 'Job resumed successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('resume scheduled job error:', error);
    return res.status(500).json({ error: error.message || 'Failed to resume job' });
  }
};

/**
 * Cancel a scheduled job
 */
export const cancelScheduledJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify job belongs to user
    const ScheduledEmail = (await import('../models/scheduledEmail.js')).default;
    const scheduledEmail = await ScheduledEmail.findByPk(id);

    if (!scheduledEmail) {
      return res.status(404).json({ error: 'Scheduled job not found' });
    }

    if (scheduledEmail.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { cancelJob } = await import('../services/emailScheduler.js');
    const updatedJob = await cancelJob(parseInt(id));

    return res.status(200).json({
      message: 'Job cancelled successfully',
      job: updatedJob,
    });
  } catch (error) {
    console.error('cancel scheduled job error:', error);
    return res.status(500).json({ error: error.message || 'Failed to cancel job' });
  }
};

/**
 * Get sent emails history
 */
export const getSentEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scheduledEmailId } = req.query;

    const { getSentEmailsHistory } = await import('../services/emailScheduler.js');
    const sentEmails = await getSentEmailsHistory(userId, scheduledEmailId ? parseInt(scheduledEmailId) : null);

    return res.status(200).json({ sentEmails });
  } catch (error) {
    console.error('get sent emails error:', error);
    return res.status(500).json({ error: 'Failed to fetch sent emails' });
  }
};

/**
 * Get all uploaded files history for user
 */
export const getUploadedFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Count distinct fileIds for pagination
    const totalItems = await UploadedRow.count({
        distinct: true,
        col: 'file_id'
    });

    const uploads = await UploadedRow.findAll({
      attributes: [
        'fileId',
        [UploadedRow.sequelize.fn('COUNT', UploadedRow.sequelize.col('id')), 'rowCount'],
        [UploadedRow.sequelize.fn('MIN', UploadedRow.sequelize.col('created_at')), 'createdAt']
      ],
      group: ['fileId'],
      order: [[UploadedRow.sequelize.fn('MIN', UploadedRow.sequelize.col('created_at')), 'DESC']],
      limit: limit,
      offset: offset
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({ 
      uploads,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('get uploaded files error:', error);
    return res.status(500).json({ error: 'Failed to fetch uploaded files' });
  }
};

/**
 * Delete sent emails (from DB and Gmail)
 */
export const deleteSentEmails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailIds } = req.body; // Array of sent_emails IDs (DB IDs)

    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return res.status(400).json({ error: 'No email IDs provided' });
    }

    const SentEmail = (await import('../models/sentEmail.js')).default;
    
    // Fetch emails to get Gmail message IDs
    const emailsToDelete = await SentEmail.findAll({
      where: {
        id: emailIds,
        userId: userId
      }
    });

    if (emailsToDelete.length === 0) {
      return res.status(404).json({ error: 'No matching emails found to delete' });
    }

    // Extract Gmail message IDs
    const gmailMessageIds = emailsToDelete
      .filter(email => email.messageId)
      .map(email => email.messageId);

    // Delete from Gmail if there are valid message IDs
    if (gmailMessageIds.length > 0) {
      const user = await User.findByPk(userId);
      
      // Check for token refresh
      const { isTokenExpired, refreshAccessToken, getGmailClient } = await import('../utils/gmailAuth.js');
      if (user.gmailTokenExpiry && isTokenExpired(user.gmailTokenExpiry)) {
         const newTokens = await refreshAccessToken(user.gmailRefreshToken);
         user.gmailAccessToken = newTokens.access_token;
         await user.save();
      }

      // Initialize Gmail client
      const gmailClient = getGmailClient(user);
      
      // Call batch delete
      const { deleteMessages } = await import('../utils/gmailService.js');
      await deleteMessages(gmailClient, gmailMessageIds);
    }

    // Delete from Database
    await SentEmail.destroy({
      where: {
        id: emailIds,
        userId: userId
      }
    });

    return res.status(200).json({ 
      message: `Successfully deleted ${emailsToDelete.length} emails`,
      deletedIds: emailsToDelete.map(e => e.id)
    });

  } catch (error) {
    console.error('delete sent emails error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete emails' });
  }
};
