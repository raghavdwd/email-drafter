import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getVariablesForUser, getAllTemplatesForUser } from '../utils/emailApi';

const VariablesGuide = () => {
  const navigate = useNavigate();
  const [variables, setVariables] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateVariables, setTemplateVariables] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      extractTemplateVariables();
    } else {
      setTemplateVariables(new Set());
    }
  }, [selectedTemplate, templates]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [varsData, templatesData] = await Promise.all([
        getVariablesForUser(),
        getAllTemplatesForUser()
      ]);
      setVariables(varsData.variables || []);
      setTemplates(templatesData.templates || []);
    } catch (err) {
      console.error('fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractTemplateVariables = () => {
    const template = templates.find(t => t.id === parseInt(selectedTemplate));
    if (!template) {
      setTemplateVariables(new Set());
      return;
    }

    const templateText = `${template.subject} ${template.body}`;
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const usedVars = new Set();
    let match;
    
    while ((match = variablePattern.exec(templateText)) !== null) {
      usedVars.add(match[1].trim());
    }
    
    setTemplateVariables(usedVars);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'link': return '🔗';
      default: return '📝';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch(type) {
      case 'text': return 'badge-info';
      case 'image': return 'badge-secondary';
      case 'link': return 'badge-accent';
      default: return 'badge-neutral';
    }
  };

  const isVariableUsedInTemplate = (variableName) => {
    return selectedTemplate && templateVariables.has(variableName);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-base-content mb-2">
            📋 Variables Guide
          </h1>
          <p className="text-lg text-base-content/70">
            Complete reference for email template variables and Excel mapping
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Guide & Instructions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Start Guide */}
              <div className="card bg-base-100 border border-base-content/10 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-lg mb-4">📖 Quick Start</h2>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <span className="badge badge-primary badge-sm">1</span>
                        Prepare Your Excel File
                      </h3>
                      <p className="text-base-content/70 text-xs leading-relaxed mb-2">
                        Your Excel file columns should match the <strong>Variable Names</strong> exactly as shown in templates.
                      </p>
                      <div className="bg-info/10 p-2 rounded text-xs">
                        <strong>✨ New!</strong> Column names now match template variables directly:
                        <br/>• Template uses: <code className="bg-base-200 px-1 rounded">{'{{First Name}}'}</code>
                        <br/>• Excel column: <strong>First Name</strong> (exactly as shown!)
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <span className="badge badge-primary badge-sm">2</span>
                        Variable Types
                      </h3>
                      <ul className="text-xs text-base-content/70 space-y-1.5 ml-4">
                        <li>📝 <strong>Text</strong> - Plain text values (names, numbers, etc.)</li>
                        <li>� <strong>Link</strong> - Website URLs (displayed as clickable links)</li>
                        <li>�🖼️ <strong>Image</strong> - Image URLs (automatically embedded as images, not links!)</li>
                      </ul>
                      <div className="bg-success/10 p-2 rounded text-xs mt-2">
                        <strong>💡 Tip:</strong> Image variables are automatically converted to inline images - recipients see the actual image, not a URL!
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <span className="badge badge-primary badge-sm">3</span>
                        Using in Templates
                      </h3>
                      <p className="text-base-content/70 text-xs leading-relaxed">
                        In email templates, wrap variable names in double curly braces:
                      </p>
                      <code className="bg-base-200 px-2 py-1 rounded block mt-1 text-xs">
                        Hi {'{{First Name}}'}, your website {'{{Website}}'} looks great!
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Filter */}
              <div className="card bg-primary/5 border border-primary/20 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-lg mb-4">🎯 Filter by Template</h2>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-sm">Select a template to highlight required variables</span>
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="">All Variables</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTemplate && (
                    <div className="mt-4 text-xs text-base-content/70">
                      <p className="mb-2">
                        <strong>{templateVariables.size}</strong> variable(s) used in this template
                      </p>
                      <p className="italic">
                        Variables highlighted below are required for this template
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Excel Mapping Example */}
              <div className="card bg-base-100 border border-base-content/10 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-lg mb-4">📊 Excel Column Names</h2>
                  
                  <div className="text-xs space-y-3">
                    <p className="text-base-content/70">
                      <strong className="text-success">✓ Use Variable Display Names:</strong>
                    </p>
                    <div className="overflow-x-auto">
                      <table className="table table-xs border">
                        <thead>
                          <tr className="bg-success/10">
                            <th>First Name</th>
                            <th>Website</th>
                            <th>Client Traffic</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>John</td>
                            <td>example.com</td>
                            <td>15000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="divider my-2"></div>
                    
                    <p className="text-base-content/70">
                      <strong className="text-error">✗ Do NOT use camelCase:</strong>
                    </p>
                    <div className="overflow-x-auto">
                      <table className="table table-xs border opacity-50">
                        <thead>
                          <tr className="bg-error/10">
                            <th className="line-through">firstName</th>
                            <th className="line-through">website</th>
                            <th className="line-through">clientTraffic</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                  </div>
                  
                  <div className="alert alert-warning text-xs mt-4 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Column headers are case-sensitive and must match <strong>exactly</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Variables List */}
            <div className="lg:col-span-2">
              <div className="card bg-base-100 border border-base-content/10 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="card-title text-xl">Available Variables ({variables.length})</h2>
                    {selectedTemplate && (
                      <span className="badge badge-primary">
                        {templateVariables.size} required for selected template
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {variables.length === 0 ? (
                      <div className="text-center p-8 text-base-content/60">
                        No variables found. Please contact admin.
                      </div>
                    ) : (
                      variables.map((variable) => {
                        const isRequired = isVariableUsedInTemplate(variable.variableName);
                        
                        return (
                          <div 
                            key={variable.id} 
                            className={`card border transition-all ${
                              isRequired 
                                ? 'bg-primary/5 border-primary shadow-md ring-2 ring-primary/20' 
                                : 'bg-base-100 border-base-content/10 hover:border-primary/30'
                            }`}
                          >
                            <div className="card-body p-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {isRequired && (
                                      <span className="badge badge-primary badge-xs">REQUIRED</span>
                                    )}
                                    <h3 className="font-bold text-base">{variable.variableName}</h3>
                                    <span className={`badge ${getTypeBadgeClass(variable.variableType)} badge-sm`}>
                                      {getTypeIcon(variable.variableType)} {variable.variableType}
                                    </span>
                                  </div>
                                  
                                  {variable.description && (
                                    <p className="text-sm text-base-content/70 mb-3">{variable.description}</p>
                                  )}

                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="bg-base-200/50 p-2 rounded">
                                      <div className="font-semibold text-base-content/50 mb-1">Template Usage</div>
                                      <code className="text-primary font-mono text-xs">
                                        {'{{'  + variable.variableName + '}}'}
                                      </code>
                                    </div>
                                    <div className="bg-base-200/50 p-2 rounded">
                                      <div className="font-semibold text-base-content/50 mb-1">Excel Column Name</div>
                                      <code className="text-accent font-mono text-xs font-bold">
                                        {variable.variableName}
                                      </code>
                                    </div>
                                  </div>
                                  
                                  {variable.variableType === 'image' && (
                                    <div className="alert alert-info text-xs py-2 mt-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      <span>✨ Image URLs are automatically embedded as inline images in emails</span>
                                    </div>
                                  )}
                                </div>

                                {isRequired && (
                                  <div className="tooltip tooltip-left" data-tip="Required for selected template">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariablesGuide;
