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

