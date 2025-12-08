import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { uploadExcel, getTemplates, generateDrafts, checkGmailConnection, connectGmail, disconnectGmail } from '../utils/emailApi';

// user dashboard for approved users
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // state management
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // fetch templates and check Gmail connection on mount
  useEffect(() => {
    fetchTemplates();
    checkConnection();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('fetch templates error:', err);
    }
  };

  const checkConnection = async () => {
    try {
      setCheckingConnection(true);
      const data = await checkGmailConnection();
      setGmailConnected(data.connected && !data.tokenExpired);
    } catch (err) {
      console.error('check gmail connection error:', err);
      setGmailConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      // reset previous upload data
      setFileId('');
      setRowCount(0);
      setDrafts([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await uploadExcel(file);
      setFileId(data.fileId);
      setRowCount(data.count);
      setSuccess(`Successfully uploaded ${data.count} rows`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload Excel file');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDrafts = async () => {
    if (!fileId) {
      setError('Please upload an Excel file first');
      return;
    }

    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    if (!gmailConnected) {
      setError('Please connect your Gmail account first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await generateDrafts(fileId, parseInt(selectedTemplate));
      setDrafts(data.drafts || []);
      setSuccess(data.message || `Created ${data.successCount} drafts successfully!`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setLoading(true);
      const data = await connectGmail();
      // Redirect user to Google OAuth
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate Gmail connection');
      setLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!confirm('Are you sure you want to disconnect Gmail?')) {
      return;
    }

    try {
      setLoading(true);
      await disconnectGmail();
      setGmailConnected(false);
      setSuccess('Gmail disconnected successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to disconnect Gmail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* navbar */}
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-base-content">
            email drafter
          </a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img alt="user avatar" src={user?.photo} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <a className="justify-between text-base-content">
                  {user?.name}
                  <span className="badge badge-success">approved</span>
                </a>
              </li>
              <li>
                <a onClick={handleLogout} className="text-base-content">
                  logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-base-content mb-6">
          Email Drafting Tool
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

        {/* pending approval alert */}
        {user?.status === 'pending' ? (
          <div className="card w-96 bg-base-200 shadow-xl mx-auto mt-10">
            <div className="card-body items-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-warning shrink-0 h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="card-title text-warning">Account Pending</h2>
              <p>Your account is currently pending approval from an administrator.</p>
              <p className="text-sm text-base-content/70 mt-2">Please check back later or contact support.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Gmail connection section */}
            <div className="card bg-base-200 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title text-base-content">
                  Gmail Connection
                </h2>
                {checkingConnection ? (
                  <div className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="text-base-content/70">Checking connection...</span>
                  </div>
                ) : gmailConnected ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-success">Connected</span>
                      <span className="text-base-content/70">Your Gmail is connected</span>
                    </div>
                    <button
                      onClick={handleDisconnectGmail}
                      disabled={loading}
                      className="btn btn-sm btn-error"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-warning">Not Connected</span>
                      <span className="text-base-content/70">Connect Gmail to create drafts</span>
                    </div>
                    <button
                      onClick={handleConnectGmail}
                      disabled={loading}
                      className="btn btn-sm btn-primary"
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        'Connect Gmail'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* step 1: upload excel */}
            <div className="card bg-base-200 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title text-base-content">
                  Step 1: Upload Excel File
                </h2>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Select Excel file (.xlsx, .xls)</span>
                  </label>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="file-input file-input-bordered w-full"
                  />
                </div>
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
                {rowCount > 0 && (
                  <div className="alert alert-info mt-4">
                    <span>{rowCount} rows found</span>
                  </div>
                )}
              </div>
            </div>

            {/* step 2: select template */}
            <div className="card bg-base-200 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title text-base-content">
                  Step 2: Select Email Template
                </h2>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Choose a template</span>
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="select select-bordered w-full"
                    disabled={!fileId}
                  >
                    <option value="">Select Template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* step 3: generate drafts */}
            <div className="card bg-base-200 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title text-base-content">
                  Step 3: Generate Gmail Drafts
                </h2>
                <div className="card-actions justify-end">
                  <button
                    onClick={handleGenerateDrafts}
                    disabled={!fileId || !selectedTemplate || !gmailConnected || loading}
                    className="btn btn-success"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Draft Emails'
                    )}
                  </button>
                </div>
                {!gmailConnected && (
                  <div className="alert alert-warning mt-4">
                    <span>Please connect your Gmail account first</span>
                  </div>
                )}
              </div>
            </div>

            {/* drafts result */}
            {drafts.length > 0 && (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-base-content">
                    Draft Creation Results ({drafts.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr className="text-base-content">
                          <th>Row #</th>
                          <th>Status</th>
                          <th>Draft ID / Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drafts.map((draft) => (
                          <tr key={draft.row} className="hover">
                            <td className="text-base-content">Row {draft.row}</td>
                            <td>
                              {draft.success ? (
                                <span className="badge badge-success">Success</span>
                              ) : (
                                <span className="badge badge-error">Failed</span>
                              )}
                            </td>
                            <td className="text-base-content text-sm">
                              {draft.success ? (
                                <span className="font-mono">{draft.draftId}</span>
                              ) : (
                                <span className="text-error">{draft.error}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

