import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { createTemplate, getAllTemplatesAdmin, deleteTemplate } from '../utils/emailApi';

// admin dashboard with user approval table and template management
const AdminDashboard = () => {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
  });

  // fetch all users and templates on mount
  useEffect(() => {
    fetchUsers();
    fetchTemplates();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.error || 'failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await getAllTemplatesAdmin();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('fetch templates error:', err);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/approve/${userId}`);
      // refresh user list
      fetchUsers();
      setSuccess('User approved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'failed to approve user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleTemplateFormChange = (e) => {
    setTemplateForm({
      ...templateForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    
    if (!templateForm.name || !templateForm.subject || !templateForm.body) {
      setError('All fields are required');
      return;
    }

    try {
      await createTemplate(templateForm);
      setSuccess('Template created successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      // reset form
      setTemplateForm({ name: '', subject: '', body: '' });
      
      // refresh templates
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await deleteTemplate(id);
      setSuccess('Template deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      // refresh templates
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete template');
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* navbar */}
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-base-content">
            admin dashboard
          </a>
        </div>
        <div className="flex-none">
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            logout
          </button>
        </div>
      </div>

      {/* main content */}
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-base-content mb-6">
          Admin Panel
        </h1>

        {/* error alert */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* success alert */}
        {success && (
          <div className="alert alert-success mb-4">
            <span>{success}</span>
          </div>
        )}

        {/* user management section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-base-content mb-4">
            User Management
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="overflow-x-auto bg-base-200 rounded-lg shadow-xl">
              <table className="table">
                <thead>
                  <tr className="text-base-content">
                    <th>name</th>
                    <th>email</th>
                    <th>signup date</th>
                    <th>status</th>
                    <th>action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-base-content/70">
                        no users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover">
                        <td className="text-base-content">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="mask mask-squircle h-12 w-12">
                                <img src={user.photo} alt={user.name} />
                              </div>
                            </div>
                            <div>{user.name}</div>
                          </div>
                        </td>
                        <td className="text-base-content">{user.email}</td>
                        <td className="text-base-content">
                          {formatDate(user.createdAt)}
                        </td>
                        <td>
                          {user.status === 'approved' ? (
                            <span className="badge badge-success">approved</span>
                          ) : (
                            <span className="badge badge-warning">pending</span>
                          )}
                        </td>
                        <td>
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="btn btn-success btn-sm"
                            >
                              approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* template management section */}
        <div>
          <h2 className="text-2xl font-bold text-base-content mb-4">
            Email Template Management
          </h2>

          {/* create template form */}
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body">
              <h3 className="card-title text-base-content">Create New Template</h3>
              <form onSubmit={handleCreateTemplate}>
                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Template Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={templateForm.name}
                    onChange={handleTemplateFormChange}
                    placeholder="e.g., Cold Email Template"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Subject</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={templateForm.subject}
                    onChange={handleTemplateFormChange}
                    placeholder="e.g., Opportunity for {{Client Business Name}}"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control w-full mb-4">
                  <label className="label">
                    <span className="label-text">Body</span>
                    <span className="label-text-alt">
                      Available placeholders: First Name, Client Business Name, Client Traffic, etc.
                    </span>
                  </label>
                  <textarea
                    name="body"
                    value={templateForm.body}
                    onChange={handleTemplateFormChange}
                    placeholder="Hi {{First Name}}, I noticed {{Client Business Name}} has {{Client Traffic}} visitors..."
                    className="textarea textarea-bordered h-32"
                  />
                </div>

                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-primary">
                    Create Template
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* templates list */}
          <div className="overflow-x-auto bg-base-200 rounded-lg shadow-xl">
            <table className="table">
              <thead>
                <tr className="text-base-content">
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-base-content/70">
                      no templates found
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id} className="hover">
                      <td className="text-base-content">{template.name}</td>
                      <td className="text-base-content">
                        {template.subject.length > 50
                          ? template.subject.substring(0, 50) + '...'
                          : template.subject}
                      </td>
                      <td className="text-base-content">
                        {formatDate(template.createdAt)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="btn btn-error btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

