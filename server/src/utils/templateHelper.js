/**
 * Replaces placeholders in template string with actual values
 * @param {string} template - Template string with placeholders like {{First Name}}
 * @param {object} data - Object with actual values
 * @returns {string} - String with placeholders replaced
 */
export const replacePlaceholders = (template, data) => {
  if (!template) return '';

  let result = template;

  // mapping of placeholder names to data keys
  const placeholderMap = {
    '{{First Name}}': data.firstName || '',
    '{{Client Business Name}}': data.clientBusinessName || '',
    '{{Client business name}}': data.clientBusinessName || '',
    '{{Company Name}}': data.clientBusinessName || '',
    '{{Website}}': data.website || '',
    '{{Client Website}}': data.website || '',
    '{{Client Traffic}}': data.clientTraffic?.toString() || '',
    '{{Client traffic}}': data.clientTraffic?.toString() || '',
    '{{Competitor Name}}': data.competitorName || '',
    '{{Competitor Business Name 1}}': data.competitorName || '',
    '{{Competitor business name}}': data.competitorName || '',
    '{{Competitor Traffic}}': data.competitorTraffic?.toString() || '',
    '{{Competitor traffic}}': data.competitorTraffic?.toString() || '',
    '{{Competitor Traffic 1}}': data.competitorTraffic?.toString() || '',
    '{{Competitor Website}}': data.competitorWebsite || '',
    '{{Competitor Website 1}}': data.competitorWebsite || '',
    '{{Competitor Website Link}}': data.competitorWebsite || '',
    '{{Competitor Name 2}}': data.competitorName2 || '',
    '{{Competitor Business Name 2}}': data.competitorName2 || '',
    '{{Competitor Traffic 2}}': data.competitorTraffic2?.toString() || '',
    '{{Competitor Website 2}}': data.competitorWebsite2 || '',
    '{{Calendar Link}}': data.calendarLink || '',
    '{{Client Screenshot URL}}': data.clientScreenshotUrl || '',
    '{{Client Screenshot}}': data.clientScreenshotUrl || '',
    '{{Client SS}}': data.clientScreenshotUrl || '',
    '{{Competitor Screenshot URL}}': data.competitorScreenshotUrl || '',
    '{{Competitor Screenshot}}': data.competitorScreenshotUrl || '',
    '{{Sending Account Name}}': data.sendingAccountName || '',
    '{{SendingAccountName}}': data.sendingAccountName || '',
    '{{Email}}': data.sendingAccountName || '',
  };

  // replace all placeholders
  Object.entries(placeholderMap).forEach(([placeholder, value]) => {
    result = result.split(placeholder).join(value);
  });

  return result;
};

/**
 * Generates Gmail draft URL for given email data
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {string} to - Recipient email (optional)
 * @returns {string} - Gmail draft URL
 */
export const generateGmailDraftUrl = (subject, body, to = '') => {
  const baseUrl = 'https://mail.google.com/mail/?view=cm&fs=1';
  
  const params = new URLSearchParams();
  if (to) params.append('to', to);
  params.append('su', subject);
  params.append('body', body);

  return `${baseUrl}&${params.toString()}`;
};
