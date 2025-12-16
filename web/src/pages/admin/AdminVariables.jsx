import React, { useState, useEffect } from 'react';
import { createVariable, getAllVariablesAdmin, deleteVariable, updateVariable } from '../../utils/emailApi';

const AdminVariables = () => {
    const [variables, setVariables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Edit mode state
    const [editingId, setEditingId] = useState(null);
    
    const [variableForm, setVariableForm] = useState({
        variableName: '',
        variableKey: '',
        variableType: 'text',
        description: '',
    });

    useEffect(() => {
        fetchVariables();
    }, []);

    const fetchVariables = async () => {
        try {
            setLoading(true);
            const data = await getAllVariablesAdmin();
            setVariables(data.variables || []);
        } catch (err) {
            console.error('fetch variables error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVariableFormChange = (e) => {
        const { name, value } = e.target;
        setVariableForm({
            ...variableForm,
            [name]: value,
        });
        
        // Auto-generate camelCase key from name if key field is empty
        if (name === 'variableName' && !variableForm.variableKey) {
            const camelCaseKey = value
                .split(' ')
                .map((word, index) => 
                    index === 0 
                        ? word.toLowerCase() 
                        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join('');
            setVariableForm(prev => ({ ...prev, variableKey: camelCaseKey }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!variableForm.variableName || !variableForm.variableKey) {
            setError('Variable name and key are required');
            return;
        }

        try {
            if (editingId) {
                // Update existing variable
                await updateVariable(editingId, variableForm);
                setSuccess('Variable updated successfully');
            } else {
                // Create new variable
                await createVariable(variableForm);
                setSuccess('Variable created successfully');
            }
            
            setTimeout(() => setSuccess(''), 3000);
            resetForm();
            fetchVariables();
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${editingId ? 'update' : 'create'} variable`);
        }
    };

    const handleEditClick = (variable) => {
        setEditingId(variable.id);
        setVariableForm({
            variableName: variable.variableName,
            variableKey: variable.variableKey,
            variableType: variable.variableType,
            description: variable.description || '',
        });
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const resetForm = () => {
        setEditingId(null);
        setVariableForm({ variableName: '', variableKey: '', variableType: 'text', description: '' });
        setError('');
    };

    const handleDeleteVariable = async (id) => {
        if (!confirm('Are you sure you want to delete this variable?')) return;

        try {
            await deleteVariable(id);
            setSuccess('Variable deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
            if (editingId === id) {
                resetForm();
            }
            fetchVariables();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete variable');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Create/Edit Form */}
            <div className="lg:col-span-1">
                 <div className="card bg-base-100 border border-base-content/10 shadow-xl sticky top-8">
                    <div className="card-body">
                        <h3 className="card-title text-xl mb-4">
                            {editingId ? 'Edit Variable' : 'Create New Variable'}
                        </h3>
                        
                        {error && <div className="alert alert-error text-sm py-2 rounded mb-2 w-full"><span>{error}</span></div>}
                        {success && <div className="alert alert-success text-sm py-2 rounded mb-2 w-full"><span>{success}</span></div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control w-full">
                                <label className="label"><span className="label-text font-medium">Variable Name</span></label>
                                <input 
                                    type="text" 
                                    name="variableName" 
                                    value={variableForm.variableName} 
                                    onChange={handleVariableFormChange} 
                                    placeholder="e.g., First Name, Company Name" 
                                    className="input input-bordered w-full" 
                                />
                                <label className="label">
                                    <span className="label-text-alt opacity-60">This is how it appears in templates: {'{{'}{variableForm.variableName || 'Variable Name'}{'}}'}</span>
                                </label>
                            </div>

                            <div className="form-control w-full">
                                <label className="label"><span className="label-text font-medium">Variable Key</span></label>
                                <input 
                                    type="text" 
                                    name="variableKey" 
                                    value={variableForm.variableKey} 
                                    onChange={handleVariableFormChange} 
                                    placeholder="e.g., firstName, companyName" 
                                    className="input input-bordered w-full font-mono text-sm" 
                                />
                                <label className="label">
                                    <span className="label-text-alt opacity-60">Must be in camelCase format</span>
                                </label>
                            </div>

                            <div className="form-control w-full">
                                <label className="label"><span className="label-text font-medium">Variable Type</span></label>
                                <select 
                                    name="variableType" 
                                    value={variableForm.variableType} 
                                    onChange={handleVariableFormChange} 
                                    className="select select-bordered w-full"
                                >
                                    <option value="text">📝 Text</option>
                                    <option value="image">🖼️ Image</option>
                                    <option value="link">🔗 Link</option>
                                </select>
                                <label className="label">
                                    <span className="label-text-alt opacity-60">Type determines how the variable is rendered</span>
                                </label>
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium">Description (Optional)</span>
                                </label>
                                <textarea 
                                    name="description" 
                                    value={variableForm.description} 
                                    onChange={handleVariableFormChange} 
                                    placeholder="Brief description for admin reference" 
                                    className="textarea textarea-bordered h-20"
                                ></textarea>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className={`btn w-full ${editingId ? 'btn-warning' : 'btn-primary'}`}>
                                    {editingId ? 'Update Variable' : 'Create Variable'}
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
                        <h2 className="text-2xl font-bold">Template Variables</h2>
                        <p className="text-base-content/60">Manage template variables for email customization.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>
                ) : (
                    <div className="grid gap-4">
                        {variables.length === 0 ? (
                            <div className="text-center p-12 bg-base-100 rounded-xl border border-dashed border-base-content/20">
                                <p className="text-base-content/60">No variables found. Create one to get started.</p>
                            </div>
                        ) : (
                            variables.map((variable) => (
                                <div key={variable.id} className={`card bg-base-100 border border-base-content/10 shadow-sm hover:shadow-md transition-all group ${editingId === variable.id ? 'ring-2 ring-warning' : ''}`}>
                                    <div className="card-body p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-lg text-primary">{variable.variableName}</h3>
                                                    <span className={`badge ${getTypeBadgeClass(variable.variableType)} badge-sm`}>
                                                        {getTypeIcon(variable.variableType)} {variable.variableType}
                                                    </span>
                                                </div>
                                                <p className="font-mono text-sm text-base-content/70 bg-base-200/50 px-2 py-1 rounded inline-block mb-2">
                                                    {variable.variableKey}
                                                </p>
                                                {variable.description && (
                                                    <p className="text-sm text-base-content/60 mt-2">{variable.description}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEditClick(variable)} className="btn btn-ghost btn-circle btn-sm tooltip" data-tip="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDeleteVariable(variable.id)} className="btn btn-ghost btn-circle btn-sm text-error tooltip" data-tip="Delete">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-xs text-base-content/40">
                                            Created: {formatDate(variable.createdAt)}
                                        </div>
                                        <div className="mt-2 text-xs bg-base-200/30 p-2 rounded border border-base-content/5">
                                            <span className="font-semibold">Usage in templates:</span> <code className="text-primary">{'{{'}{variable.variableName}{'}}'}</code>
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

export default AdminVariables;
