import TemplateVariable from '../models/templateVariable.js';

/**
 * Loads variables from database and builds placeholder map
 * @returns {Promise<Object>} - Map of placeholder names to variable keys
 */
export const loadVariablesFromDB = async () => {
  try {
    const variables = await TemplateVariable.findAll();
    const placeholderMap = {};
    
    variables.forEach(variable => {
      const placeholder = `{{${variable.variableName}}}`;
      placeholderMap[placeholder] = variable.variableKey;
    });
    
    return placeholderMap;
  } catch (error) {
    console.error('Error loading variables from database:', error);
    return {};
  }
};

/**
 * Replace placeholders like {{Variable Name}} in a string with actual values from row data
 * Now uses variable display names directly - Excel columns should match {{Variable Name}} exactly
 * For image variables, marks them for inline embedding instead of displaying URLs
 * @param {string} text - Template text with {{placeholders}}
 * @param {Object} row - Row data object with column names matching variable display names
 * @returns {Promise<{text: string, images: Array}>} - Processed text and list of images to embed
 */
export const replacePlaceholders = async (text, row) => {
  if (!text || typeof text !== 'string') return { text, images: [] };

  // Load variables from database to check types
  const variables = await TemplateVariable.findAll();
  
  // Create maps for variable types
  const variableTypeMap = {};
  variables.forEach(v => {
    variableTypeMap[v.variableName] = v.variableType;
  });

  // Legacy fallback support for old camelCase keys (backward compatibility)
  const legacyMap = {
    '{{First Name}}': 'firstName',
    '{{Client Business Name}}': 'clientBusinessName',
    '{{Company Name}}': 'clientBusinessName',
    '{{Website}}': 'website',
    '{{Client Website}}': 'website',
    '{{Client Traffic}}': 'clientTraffic',
    '{{Competitor Name}}': 'competitorName',
    '{{Competitor Business Name 1}}': 'competitorName',
    '{{Competitor Traffic}}': 'competitorTraffic',
    '{{Competitor Traffic 1}}': 'competitorTraffic',
    '{{Competitor Website}}': 'competitorWebsite',
    '{{Competitor Website 1}}': 'competitorWebsite',
    '{{Competitor Name 2}}': 'competitorName2',
    '{{Competitor Business Name 2}}': 'competitorName2',
    '{{Competitor Traffic 2}}': 'competitorTraffic2',
    '{{Competitor Website 2}}': 'competitorWebsite2',
    '{{Calendar Link}}': 'calendarLink',
    '{{Client Screenshot URL}}': 'clientScreenshotUrl',
    '{{Client Screenshot}}': 'clientScreenshotUrl',
    '{{Client SS}}': 'clientScreenshotUrl',
    '{{Competitor Screenshot URL}}': 'competitorScreenshotUrl',
    '{{Competitor Screenshot}}': 'competitorScreenshotUrl',
    '{{Sending Account Name}}': 'sendingAccountName',
    '{{Email}}': 'sendingAccountName',
  };

  const imagesToEmbed = [];
  let processedText = text;

  // Replace each {{placeholder}} with its value
  processedText = processedText.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    
    // Parse rawData if available (contains all original Excel columns)
    let excelData = {};
    if (row.rawData) {
      try {
        excelData = JSON.parse(row.rawData);
      } catch (e) {
        console.error('Failed to parse rawData:', e);
      }
    }
    
    let value = null;
    let foundKey = null;
    
    // Try to find value: Excel rawData > row direct > legacy key
    if (excelData[trimmedName] !== undefined && excelData[trimmedName] !== null && excelData[trimmedName] !== '') {
      value = excelData[trimmedName];
      foundKey = trimmedName;
    } else if (row[trimmedName] !== undefined && row[trimmedName] !== null && row[trimmedName] !== '') {
      value = row[trimmedName];
      foundKey = trimmedName;
    } else {
      const legacyKey = legacyMap[match];
      if (legacyKey && row[legacyKey] !== undefined && row[legacyKey] !== null && row[legacyKey] !== '') {
        value = row[legacyKey];
        foundKey = legacyKey;
      }
    }
    
    if (value === null) {
      return match; // No value found, return placeholder as-is
    }
    
    // Check if this is an image variable
    const variableType = variableTypeMap[trimmedName];
    if (variableType === 'image' && value) {
      // This is an image - mark it for inline embedding
      const imageId = `image_${imagesToEmbed.length}`;
      imagesToEmbed.push({
        url: value,
        variableName: trimmedName,
        placeholder: match,
        imageId
      });
      // Return a placeholder that will be replaced with <img> tag later
      return `__IMAGE_PLACEHOLDER_${imageId}__`;
    }
    
    // Special handling for Calendar Link - show as clickable "Link" text
    if (trimmedName === 'Calendar Link' && value) {
      const linkUrl = String(value).trim();
      return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline;">Link</a>`;
    }
    
    // For non-image variables, return the value
    return value;
  });

  return { text: processedText, images: imagesToEmbed };
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
