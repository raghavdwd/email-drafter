import React, { useState, useEffect } from 'react';
import { createTemplate, getAllTemplatesAdmin, deleteTemplate, updateTemplate, getAllVariablesAdmin } from '../../utils/emailApi';

const AdminTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [variables, setVariables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Edit mode state
    const [editingId, setEditingId] = useState(null);
    
    const [templateForm, setTemplateForm] = useState({
        name: '',
        subject: '',
        body: '',
    });

    useEffect(() => {
        fetchTemplates();
        fetchVariables();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await getAllTemplatesAdmin();
            setTemplates(data.templates || []);
        } catch (err) {
            console.error('fetch templates error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVariables = async () => {
        try {
            const data = await getAllVariablesAdmin();
            setVariables(data.variables || []);
        } catch (err) {
            console.error('fetch variables error:', err);
        }
    };

    const handleTemplateFormChange = (e) => {
        setTemplateForm({
            ...templateForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!templateForm.name || !templateForm.subject || !templateForm.body) {
            setError('All fields are required');
            return;
        }

        try {
            if (editingId) {
                // Update existing template
                await updateTemplate(editingId, templateForm);
                setSuccess('Template updated successfully');
            } else {
                // Create new template
                await createTemplate(templateForm);
                setSuccess('Template created successfully');
            }
            
            setTimeout(() => setSuccess(''), 3000);
            resetForm();
            fetchTemplates();
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${editingId ? 'update' : 'create'} template`);
        }
    };

    const handleEditClick = (template) => {
        setEditingId(template.id);
        setTemplateForm({
            name: template.name,
            subject: template.subject,
            body: template.body,
        });
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const resetForm = () => {
        setEditingId(null);
        setTemplateForm({ name: '', subject: '', body: '' });
        setError('');
    };

    const handleDeleteTemplate = async (id) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            await deleteTemplate(id);
            setSuccess('Template deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
            if (editingId === id) {
                resetForm();
            }
            fetchTemplates();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete template');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Create/Edit Form */}
            <div className="lg:col-span-1">
                 <div className="card bg-base-100 border border-base-content/10 shadow-xl sticky top-8">
                    <div className="card-body">
                        <h3 className="card-title text-xl mb-4">
                            {editingId ? 'Edit Template' : 'Create New Template'}
                        </h3>
                        
                        {error && <div className="alert alert-error text-sm py-2 rounded mb-2 w-full"><span>{error}</span></div>}
                        {success && <div className="alert alert-success text-sm py-2 rounded mb-2 w-full"><span>{success}</span></div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text font-medium">Template Name</span></label>
                                <input type="text" name="name" value={templateForm.name} onChange={handleTemplateFormChange} placeholder="e.g., Cold Email" className="input input-bordered w-full" />
                            </div>

                            <div className="form-control w-full">
                                <label className="label"><span className="label-text font-medium">Subject Line</span></label>
                                <input type="text" name="subject" value={templateForm.subject} onChange={handleTemplateFormChange} placeholder="Subject with {{variables}}" className="input input-bordered w-full" />
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium">Email Body</span>
                                    <span className="label-text-alt text-xs opacity-60">Use {'{{Variable}}'} syntax</span>
                                </label>
                                <textarea name="body" value={templateForm.body} onChange={handleTemplateFormChange} placeholder="Hi {{Name}}..." className="textarea textarea-bordered h-48 leading-relaxed"></textarea>
                            </div>

                            {/* Available Variables Reference */}
                            {variables.length > 0 && (
                                <div className="mt-4 p-3 bg-base-200/30 rounded-lg border border-base-content/10">
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Available Variables
                                    </h4>
                                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                        {variables.map((variable) => (
                                            <span 
                                                key={variable.id} 
                                                className="badge badge-sm cursor-pointer hover:badge-primary transition-colors" 
                                                title={variable.description || variable.variableKey}
                                                onClick={() => {
                                                    const varText = `{{${variable.variableName}}}`;
                                                    navigator.clipboard.writeText(varText);
                                                }}
                                            >
                                                {variable.variableType === 'image' && '🖼️'}
                                                {variable.variableType === 'link' && '🔗'}
                                                {variable.variableType === 'text' && '📝'}
                                                {variable.variableName}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-base-content/50 mt-2">Click to copy</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button type="submit" className={`btn w-full ${editingId ? 'btn-warning' : 'btn-primary'}`}>
                                    {editingId ? 'Update Template' : 'Create Template'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={handleCancelEdit} className="btn btn-ghost">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Column: List */}
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Email Templates</h2>
                        <p className="text-base-content/60">Manage global templates available to users.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>
                ) : (
                    <div className="grid gap-4">
                        {templates.length === 0 ? (
                            <div className="text-center p-12 bg-base-100 rounded-xl border border-dashed border-base-content/20">
                                <p className="text-base-content/60">No templates found. Create one to get started.</p>
                            </div>
                        ) : (
                            templates.map((template) => (
                                <div key={template.id} className={`card bg-base-100 border border-base-content/10 shadow-sm hover:shadow-md transition-all group ${editingId === template.id ? 'ring-2 ring-warning' : ''}`}>
                                    <div className="card-body p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-primary">{template.name}</h3>
                                                <p className="font-medium text-base-content/80 mt-1">Subject: {template.subject}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEditClick(template)} className="btn btn-ghost btn-circle btn-sm tooltip" data-tip="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDeleteTemplate(template.id)} className="btn btn-ghost btn-circle btn-sm text-error tooltip" data-tip="Delete">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="divider my-2"></div>
                                        <p className="text-sm text-base-content/60 line-clamp-3 font-mono bg-base-200/50 p-3 rounded-lg">
                                            {template.body}
                                        </p>
                                        <div className="mt-4 text-xs text-base-content/40 text-right">
                                            Created: {formatDate(template.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTemplates;
