/**
 * Validate template variables against Excel file data
 * Check which template variables have corresponding Excel columns
 */
export const validateTemplateMapping = async (req, res) => {
  try {
    const { fileId, templateId } = req.query;

    if (!fileId || !templateId) {
      return res.status(400).json({ error: 'fileId and templateId are required' });
    }

    // Fetch template
    const template = await EmailTemplate.findByPk(parseInt(templateId));
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Fetch a sample row to get available Excel columns
    const sampleRow = await UploadedRow.findOne({
      where: { fileId },
      order: [['id', 'ASC']],
    });

    if (!sampleRow) {
      return res.status(404).json({ error: 'No rows found for this fileId' });
    }

    // Get all template variables from database
    const { default: TemplateVariable } = await import('../models/templateVariable.js');
    const allVariables = await TemplateVariable.findAll({
      order: [['variableName', 'ASC']],
    });

    // Extract all {{variable}} placeholders from template
    const templateText = `${template.subject} ${template.body}`;
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const usedVariableNames = new Set();
    let match;
    
    while ((match = variablePattern.exec(templateText)) !== null) {
      usedVariableNames.add(match[1].trim());
    }

    // Map variable names to their database entries
    const usedVariables = allVariables.filter(v => 
      usedVariableNames.has(v.variableName)
    );

    // Get available Excel data keys from sample row
    const rowData = sampleRow.get({ plain: true });
    const availableKeys = Object.keys(rowData).filter(key => 
      !['id', 'fileId', 'created_at', 'createdAt', 'updated_at', 'updatedAt'].includes(key)
    );

    // Check each used variable to see if data exists
    const variableStatus = usedVariables.map(variable => {
      const hasData = rowData[variable.variableKey] !== null && 
                      rowData[variable.variableKey] !== undefined &&
                      rowData[variable.variableKey] !== '';
      
      return {
        name: variable.variableName,
        key: variable.variableKey,
        type: variable.variableType,
        hasData,
        sampleValue: hasData ? String(rowData[variable.variableKey]).substring(0, 50) : null,
      };
    });

    const matchedCount = variableStatus.filter(v => v.hasData).length;
    const missingCount = variableStatus.filter(v => !v.hasData).length;

    return res.status(200).json({
      variables: variableStatus,
      summary: {
        total: variableStatus.length,
        matched: matchedCount,
        missing: missingCount,
      },
      availableColumns: availableKeys,
    });
  } catch (error) {
    console.error('validate template mapping error:', error);
    return res.status(500).json({ error: 'Failed to validate template mapping' });
  }
};
