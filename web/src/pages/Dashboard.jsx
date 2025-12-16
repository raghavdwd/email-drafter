import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  uploadExcel, 
  getTemplates, 
  generateDrafts, 
  checkGmailConnection, 
  connectGmail, 
  disconnectGmail,
  sendEmailsNow,
  validateTemplateMapping
} from '../utils/emailApi';
import SendOptionsModal from '../components/SendOptionsModal';
import ScheduleEmailModal from '../components/ScheduleEmailModal';
import ScheduledJobsPanel from '../components/ScheduledJobsPanel';
import SentEmailsHistory from '../components/SentEmailsHistory';
import Navbar from '../components/Navbar';

// user dashboard for approved users
const Dashboard = () => {
  const { user, logout, token, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // state management
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [startRow, setStartRow] = useState(1);
  const [endRow, setEndRow] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [showSendOptionsModal, setShowSendOptionsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [jobsRefreshTrigger, setJobsRefreshTrigger] = useState(0);

  // Extract token from URL if present (from OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken && !token) {
      // Token from OAuth redirect - store it and remove from URL
      login(urlToken, null);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [token, login]);

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
      setStartRow(1);
      setEndRow(0);
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
      setEndRow(data.count); // Set default end to total rows
      setSuccess(`Successfully uploaded ${data. count} rows`);
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

    // Validate row range
    if (startRow < 1 || startRow > rowCount) {
      setError(`Start row must be between 1 and ${rowCount}`);
      return;
    }
    if (endRow < startRow || endRow > rowCount) {
      setError(`End row must be between ${startRow} and ${rowCount}`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await generateDrafts(fileId, parseInt(selectedTemplate), startRow, endRow);
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

  const handleChooseAction = () => {
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

    setShowSendOptionsModal(true);
  };

  const handleSelectDraft = () => {
    setShowSendOptionsModal(false);
    handleGenerateDrafts();
  };

  const handleSelectSend = () => {
    setShowSendOptionsModal(false);
    setShowScheduleModal(true);
  };

  const handleSendEmails = async (intervalSeconds) => {
    // Validate row range
    if (startRow < 1 || startRow > rowCount) {
      setError(`Start row must be between 1 and ${rowCount}`);
      return;
    }
    if (endRow < startRow || endRow > rowCount) {
      setError(`End row must be between ${startRow} and ${rowCount}`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setShowScheduleModal(false);
      
      const data = await sendEmailsNow(fileId, parseInt(selectedTemplate), intervalSeconds, startRow, endRow);
      setSuccess(data.message || 'Email sending started successfully!');
      setTimeout(() => setSuccess(''), 5000);
      
      // Trigger jobs panel refresh
      setJobsRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start sending emails');
    } finally {
      setLoading(false);
    }
  };

  // Validate template mapping when both fileId and template are selected
  const fetchValidation = async () => {
    if (!fileId || !selectedTemplate) {
      setValidationResult(null);
      return;
    }

    try {
      const data = await validateTemplateMapping(fileId, parseInt(selectedTemplate));
      setValidationResult(data);
    } catch (err) {
      console.error('validation error:', err);
      setValidationResult(null);
    }
  };

  // Trigger validation when template or file changes
  useEffect(() => {
    fetchValidation();
  }, [fileId, selectedTemplate]);

  return (
    <div className="min-h-screen bg-base-100">
      {/* navbar */}
      <Navbar />

      {/* main content */}
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-base-content mb-2 tracking-tight">
            Email Drafter
          </h1>
          <p className="text-lg text-base-content/70">
            Streamline your outreach with automated drafts and scheduled sending
          </p>
        </div>

        {/* error alert */}
        {error && (
          <div className="alert alert-error mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {/* success alert */}
        {success && (
          <div className="alert alert-success mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{success}</span>
          </div>
        )}

        {/* pending approval alert */}
        {user?.status === 'pending' ? (
          <div className="card bg-base-100 shadow-xl border border-warning/20 mx-auto mt-10 max-w-lg">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-warning h-8 w-8"
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
              </div>
              <h2 className="card-title text-2xl mb-2">Account Pending</h2>
              <p className="text-base-content/70">Your account is currently pending approval from an administrator.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Gmail Status */}
              <div className={`card shadow-md border ${gmailConnected ? 'bg-success/5 border-success/20' : 'bg-base-100 border-base-200'} transition-all`}>
                <div className="card-body p-6 flex flex-row items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Gmail Status</h3>
                    <p className="text-sm opacity-80">{gmailConnected ? 'Connected & Ready' : 'Not Connected'}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {checkingConnection ? (
                        <span className="loading loading-spinner loading-md"></span>
                    ) : gmailConnected ? (
                      <button onClick={handleDisconnectGmail} className="btn btn-xs btn-outline btn-error">Disconnect</button>
                    ) : (
                      <button onClick={handleConnectGmail} className="btn btn-sm btn-primary">Connect</button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* File Status */}
              <div className={`card shadow-md border ${fileId ? 'bg-primary/5 border-primary/20' : 'bg-base-100 border-base-200'} transition-all`}>
                <div className="card-body p-6">
                  <h3 className="font-bold text-lg mb-1">Data Source</h3>
                  <p className="text-sm opacity-80">{fileId ? `${rowCount} Rows Loaded` : 'No File Uploaded'}</p>
                </div>
              </div>

               {/* Template Status */}
               <div className={`card shadow-md border ${selectedTemplate ? 'bg-secondary/5 border-secondary/20' : 'bg-base-100 border-base-200'} transition-all`}>
                <div className="card-body p-6">
                  <h3 className="font-bold text-lg mb-1">Template</h3>
                  <p className="text-sm opacity-80">{selectedTemplate ? 'Template Selected' : 'No Template Selected'}</p>
                </div>
              </div>
            </div>

            {/* Main Workflow Steps */}
            <ul className="steps w-full mb-10">
              <li className={`step ${fileId ? 'step-primary' : ''}`}>Upload Data</li>
              <li className={`step ${selectedTemplate ? 'step-primary' : ''}`}>Select Template</li>
              <li className={`step ${fileId && selectedTemplate && gmailConnected ? 'step-primary' : ''}`}>Choose Action</li>
            </ul>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Step 1 & 2 Combined Card */}
              <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-6 flex items-center gap-2">
                    <span className="badge badge-primary h-8 w-8 rounded-full flex items-center justify-center">1</span>
                    Setup Campaign
                  </h2>
                  
                  {/* Upload Section */}
                  <div className="form-control w-full mb-6">
                    <label className="label">
                      <span className="label-text font-medium">Upload Excel File (.xlsx)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="file-input file-input-bordered w-full"
                      />
                      <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="btn btn-primary"
                      >
                        {loading ? <span className="loading loading-spinner"></span> : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {/* Row Range Selection */}
                  {fileId && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Row Range Selection
                      </h3>
                      <p className="text-xs text-base-content/60 mb-3">Process a specific range of rows (Total: {rowCount} rows)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="form-control">
                          <label className="label py-1">
                            <span className="label-text text-xs font-medium">Start Row</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={rowCount}
                            value={startRow}
                            onChange={(e) => setStartRow(Math.max(1, Math.min(rowCount, parseInt(e.target.value) || 1)))}
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div className="form-control">
                          <label className="label py-1">
                            <span className="label-text text-xs font-medium">End Row</span>
                          </label>
                          <input
                            type="number"
                            min={startRow}
                            max={rowCount}
                            value={endRow}
                            onChange={(e) => setEndRow(Math.max(startRow, Math.min(rowCount, parseInt(e.target.value) || rowCount)))}
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-base-content/70">
                        Will process <span className="font-bold text-primary">{Math.max(0, endRow - startRow + 1)}</span> row(s)
                      </div>
                    </div>
                  )}

                  {/* Template Selection */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Select Email Template</span>
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="select select-bordered w-full font-medium"
                      disabled={!fileId}
                    >
                      <option value="">-- Choose Template --</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Template-Excel Field Validation */}
                  {validationResult && (
                    <div className="mt-6 p-4 bg-base-200/50 rounded-lg border border-base-content/10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Field Validation
                        </h3>
                        <div className="flex gap-2 text-xs">
                          <span className="badge badge-success badge-sm">{validationResult.summary.matched} matched</span>
                          {validationResult.summary.missing > 0 && (
                            <span className="badge badge-warning badge-sm">{validationResult.summary.missing} missing</span>
                          )}
                        </div>
                      </div>
                      
                      {validationResult.summary.missing > 0 && (
                        <div className="alert alert-warning text-xs py-2 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <span>Some template variables are missing data in your Excel file</span>
                        </div>
                      )}

                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {validationResult.variables.map((variable, idx) => (
                          <div 
                            key={idx} 
                            className={`flex items-start justify-between p-2 rounded text-xs ${
                              variable.hasData ? 'bg-success/10' : 'bg-warning/10'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {variable.hasData ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                <span className="font-semibold">{variable.name}</span>
                                <span className="badge badge-xs">{variable.type}</span>
                              </div>
                              {variable.hasData && variable.sampleValue && (
                                <div className="text-base-content/50 ml-6 truncate" title={variable.sampleValue}>
                                  Sample: {variable.sampleValue}
                                </div>
                              )}
                              {!variable.hasData && (
                                <div className="text-warning ml-6 text-xs">
                                  Excel column "{variable.key}" has no data
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Action Card */}
              <div className="card bg-base-100 shadow-xl border border-base-200 flex flex-col">
                <div className="card-body flex-1 flex flex-col justify-center items-center text-center">
                  <h2 className="card-title text-xl mb-2 flex items-center gap-2">
                    <span className="badge badge-primary h-8 w-8 rounded-full flex items-center justify-center">2</span>
                    Launch
                  </h2>
                  <p className="text-base-content/60 mb-8 max-w-sm">
                    Ready to go? Choose to create safe drafts in Gmail for manual review, or schedule automated sending.
                  </p>
                  
                  {!gmailConnected ? (
                     <div className="alert alert-warning shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <div>
                        <h3 className="font-bold">Gmail Not Connected</h3>
                        <div className="text-xs">Connect your account above to proceed.</div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleChooseAction}
                      disabled={!fileId || !selectedTemplate || !gmailConnected || loading}
                      className="btn btn-primary btn-lg w-full max-w-xs shadow-lg hover:scale-105 transition-transform"
                    >
                      {loading ? (
                        <span className="loading loading-spinner loading-md"></span>
                      ) : (
                        <>
                          Proceed to Action
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* drafts result */}
            {drafts.length > 0 && (
              <div className="card bg-base-200 shadow-xl mb-6">
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

            {/* Scheduled jobs panel */}
            <div className="card bg-base-200 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title text-base-content">Active Scheduled Jobs</h2>
                <ScheduledJobsPanel refreshTrigger={jobsRefreshTrigger} />
              </div>
            </div>

            {/* Sent emails history */}
            <SentEmailsHistory refreshTrigger={jobsRefreshTrigger} />
          </>
        )}
      </div>

      {/* Modals */}
      <SendOptionsModal
        isOpen={showSendOptionsModal}
        onClose={() => setShowSendOptionsModal(false)}
        onSelectDraft={handleSelectDraft}
        onSelectSend={handleSelectSend}
      />
      <ScheduleEmailModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSend={handleSendEmails}
        rowCount={rowCount}
      />
    </div>
  );
};

export default Dashboard;

