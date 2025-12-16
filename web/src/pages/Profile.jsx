import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getUploadedFiles, getSentEmails, deleteSentEmails } from '../utils/emailApi';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' or 'history'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data states
  const [uploads, setUploads] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Selection state for deletion
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab, pagination.currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'uploads') {
        const data = await getUploadedFiles(pagination.currentPage, pagination.itemsPerPage);
        setUploads(data.uploads || []);
        if (data.pagination) {
            setPagination(prev => ({
                ...prev,
                totalPages: data.pagination.totalPages,
                totalItems: data.pagination.totalItems
            }));
        }
      } else {
        const data = await getSentEmails(); // Fetch all sent emails
        setSentEmails(data.sentEmails || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmailIds(sentEmails.map(email => email.id));
    } else {
      setSelectedEmailIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedEmailIds.includes(id)) {
      setSelectedEmailIds(selectedEmailIds.filter(emailId => emailId !== id));
    } else {
      setSelectedEmailIds([...selectedEmailIds, id]);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedEmailIds.length} emails? This will permanently remove them from Gmail and your history.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteSentEmails(selectedEmailIds);
      // Refresh list
      await fetchData();
      setSelectedEmailIds([]);
      alert('Emails deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete emails: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />
      <div className="container mx-auto p-4 max-w-5xl flex-grow">
        
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-base-content">Your Profile</h1>
                <p className="text-base-content/70">Manage your data and email history</p>
            </div>
            {/* User Info Card could go here */}
        </div>
        

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed mb-8 bg-base-200 p-2 rounded-xl">
          <a 
            role="tab" 
            className={`tab tab-lg transition-all duration-200 ${activeTab === 'uploads' ? 'tab-active font-bold shadow-sm' : ''}`}
            onClick={() => setActiveTab('uploads')}
          >
            Upload Archives
          </a>
          <a 
            role="tab" 
            className={`tab tab-lg transition-all duration-200 ${activeTab === 'history' ? 'tab-active font-bold shadow-sm' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Sent Email History
          </a>
        </div>

        {/* Content */}
        {loading && <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>}
        
        {error && !loading && (
          <div className="alert alert-error shadow-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
            <div className="bg-base-100 card shadow-xl border border-base-200">
                <div className="card-body p-0">
                    {/* Uploads Tab */}
                    {activeTab === 'uploads' && (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr className="bg-base-200 text-base-content font-bold uppercase text-xs tracking-wider">
                                        <th className="p-4">Import ID</th>
                                        <th>Date Uploaded</th>
                                        <th>Rows Processed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uploads.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-8 text-base-content/60">No uploads found</td>
                                        </tr>
                                    ) : (
                                        uploads.map((upload) => (
                                            <tr key={upload.fileId} className="hover">
                                                <td className="font-mono text-xs opacity-70 p-4">{upload.fileId}</td>
                                                <td>{formatDate(upload.createdAt)}</td>
                                                <td>
                                                    <div className="badge badge-neutral">{upload.rowCount} rows</div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            
                            {/* Pagination Controls */}
                            {uploads.length > 0 && (
                                <div className="flex justify-center items-center py-4 border-t border-base-200 gap-4 mt-2">
                                    <div className="join">
                                        <button 
                                            className="join-item btn btn-sm" 
                                            disabled={pagination.currentPage === 1}
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        >
                                            «
                                        </button>
                                        <div className="join-item btn btn-sm no-animation cursor-default bg-base-100 hover:bg-base-100">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </div>
                                        <button 
                                            className="join-item btn btn-sm" 
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        >
                                            »
                                        </button>
                                    </div>
                                    <div className="text-xs text-base-content/60">
                                        Total: {pagination.totalItems} files
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sent History Tab */}
                    {activeTab === 'history' && (
                        <div>
                             {/* Toolbar */}
                             <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-100 rounded-t-xl sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="form-control">
                                        <label className="label cursor-pointer gap-2">
                                            <input 
                                                type="checkbox" 
                                                className="checkbox checkbox-primary" 
                                                checked={sentEmails.length > 0 && selectedEmailIds.length === sentEmails.length}
                                                onChange={handleSelectAll}
                                                disabled={sentEmails.length === 0}
                                            />
                                            <span className="label-text font-medium">Select All</span>
                                        </label>
                                    </div>
                                    <span className="text-sm opacity-60">
                                        {selectedEmailIds.length} selected
                                    </span>
                                </div>
                                
                                {selectedEmailIds.length > 0 && (
                                    <button 
                                        onClick={handleDelete}
                                        className="btn btn-error btn-sm animate-in fade-in zoom-in duration-200 gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete Selected ({selectedEmailIds.length})
                                    </button>
                                )}
                             </div>

                            <div className="overflow-x-auto">
                                <table className="table table-zebra w-full">
                                    <thead>
                                        <tr className="bg-base-200 text-base-content font-bold uppercase text-xs tracking-wider">
                                            <th className="w-12 text-center">
                                                {/* Checkbox column */}
                                            </th>
                                            <th>Recipient</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                            <th>Sent At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sentEmails.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-8 text-base-content/60">No history found</td>
                                            </tr>
                                        ) : (
                                            sentEmails.map((email) => (
                                                <tr key={email.id} className="hover">
                                                    <td className="text-center">
                                                        <label>
                                                            <input 
                                                                type="checkbox" 
                                                                className="checkbox checkbox-sm checkbox-primary" 
                                                                checked={selectedEmailIds.includes(email.id)}
                                                                onChange={() => handleSelectOne(email.id)}
                                                            />
                                                        </label>
                                                    </td>
                                                    <td className="font-medium">{email.recipientEmail}</td>
                                                    <td>
                                                        <div className="tooltip" data-tip={email.subject}>
                                                            <span className="opacity-90 block max-w-xs truncate">
                                                                {email.subject}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {email.status === 'sent' ? (
                                                            <span className="badge badge-success badge-sm badge-outline font-semibold uppercase tracking-wide">Sent</span>
                                                        ) : (
                                                            <span className="badge badge-error badge-sm badge-outline font-semibold uppercase tracking-wide">Failed</span>
                                                        )}
                                                    </td>
                                                    <td className="text-xs opacity-70 font-mono">
                                                        {formatDate(email.sentAt)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
