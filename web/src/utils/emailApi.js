import api from './api';

/**
 * Upload Excel file
 * @param {File} file - Excel file to upload
 * @returns {Promise<{fileId: string, count: number}>}
 */
export const uploadExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Get all templates for dropdown
 * @returns {Promise<{templates: Array}>}
 */
export const getTemplates = async () => {
  const response = await api.get('/templates');
  return response.data;
};

/**
 * Generate Gmail drafts (now creates actual drafts via API)
 * @param {string} fileId - File ID from upload
 * @param {number} templateId - Selected template ID
 * @returns {Promise<{message: string, drafts: Array, successCount: number, failCount: number}>}
 */
export const generateDrafts = async (fileId, templateId) => {
  const response = await api.post('/email/draft', {
    fileId,
    templateId,
  });
  return response.data;
};

/**
 * Check Gmail connection status
 * @returns {Promise<{connected: boolean, tokenExpired: boolean}>}
 */
export const checkGmailConnection = async () => {
  const response = await api.get('/auth/gmail/status');
  return response.data;
};

/**
 * Get Gmail OAuth URL (then redirect user to it)
 * @returns {Promise<{authUrl: string}>}
 */
export const connectGmail = async () => {
  const response = await api.get('/auth/gmail');
  return response.data;
};

/**
 * Disconnect Gmail
 * @returns {Promise<{message: string}>}
 */
export const disconnectGmail = async () => {
  const response = await api.post('/auth/gmail/disconnect');
  return response.data;
};

/**
 * Create email template (admin)
 * @param {object} data - Template data {name, subject, body}
 * @returns {Promise<{message: string, template: object}>}
 */
export const createTemplate = async (data) => {
  const response = await api.post('/admin/template', data);
  return response.data;
};

/**
 * Get all templates (admin)
 * @returns {Promise<{templates: Array}>}
 */
export const getAllTemplatesAdmin = async () => {
  const response = await api.get('/admin/templates');
  return response.data;
};

/**
 * Delete template (admin)
 * @param {number} id - Template ID
 * @returns {Promise<{message: string}>}
 */
export const deleteTemplate = async (id) => {
  const response = await api.delete(`/admin/template/${id}`);
  return response.data;
};

/**
 * Delete user (admin)
 * @param {number} id - User ID
 * @returns {Promise<{message: string}>}
 */
export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/user/${id}`);
  return response.data;
};

/**
 * Update template (admin)
 * @param {number} id - Template ID
 * @param {object} data - Template data {name, subject, body}
 * @returns {Promise<{message: string, template: object}>}
 */
export const updateTemplate = async (id, data) => {
  const response = await api.put(`/admin/template/${id}`, data);
  return response.data;
};

/**
 * Schedule emails to be sent with time interval
 * @param {string} fileId - File ID from upload
 * @param {number} templateId - Selected template ID
 * @param {number} intervalSeconds - Interval between emails in seconds
 * @returns {Promise<{message: string, scheduledEmailId: number, totalCount: number, intervalSeconds: number}>}
 */
export const scheduleEmails = async (fileId, templateId, intervalSeconds) => {
  const response = await api.post('/email/schedule', {
    fileId,
    templateId,
    intervalSeconds,
  });
  return response.data;
};

/**
 * Send emails immediately with time interval
 * @param {string} fileId - File ID from upload
 * @param {number} templateId - Selected template ID
 * @param {number} intervalSeconds - Interval between emails in seconds
 * @returns {Promise<{message: string, scheduledEmailId: number, totalCount: number, intervalSeconds: number}>}
 */
export const sendEmailsNow = async (fileId, templateId, intervalSeconds) => {
  const response = await api.post('/email/send-now', {
    fileId,
    templateId,
    intervalSeconds,
  });
  return response.data;
};

/**
 * Get all scheduled jobs for current user
 * @returns {Promise<{jobs: Array}>}
 */
export const getScheduledJobs = async () => {
  const response = await api.get('/email/scheduled');
  return response.data;
};

/**
 * Pause a scheduled job
 * @param {number} jobId - Job ID
 * @returns {Promise<{message: string, job: object}>}
 */
export const pauseScheduledJob = async (jobId) => {
  const response = await api.put(`/email/scheduled/${jobId}/pause`);
  return response.data;
};

/**
 * Resume a paused scheduled job
 * @param {number} jobId - Job ID
 * @returns {Promise<{message: string, job: object}>}
 */
export const resumeScheduledJob = async (jobId) => {
  const response = await api.put(`/email/scheduled/${jobId}/resume`);
  return response.data;
};

/**
 * Cancel a scheduled job
 * @param {number} jobId - Job ID
 * @returns {Promise<{message: string, job: object}>}
 */
export const cancelScheduledJob = async (jobId) => {
  const response = await api.delete(`/email/scheduled/${jobId}`);
  return response.data;
};

/**
 * Get sent emails history
 * @param {number|null} scheduledEmailId - Optional scheduled email ID to filter
 * @returns {Promise<{sentEmails: Array}>}
 */
export const getSentEmails = async (scheduledEmailId = null) => {
  const params = scheduledEmailId ? { scheduledEmailId } : {};
  const response = await api.get('/email/sent', { params });
  return response.data;
};

/**
 * Get uploaded files history
 * @returns {Promise<{uploads: Array}>}
 */
export const getUploadedFiles = async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/email/uploads', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  /**
   * Delete sent emails
   * @param {Array<number>} emailIds - Array of email IDs to delete
   * @returns {Promise<{message: string, deletedIds: Array}>}
   */
  export const deleteSentEmails = async (emailIds) => {
    try {
      const response = await api.delete('/email/history', {
        data: { emailIds }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

