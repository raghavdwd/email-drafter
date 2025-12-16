import React, { useState, useEffect } from 'react';
import { getSentEmails } from '../utils/emailApi';

/**
 * Component to display sent emails history
 */
const SentEmailsHistory = ({ scheduledEmailId = null, refreshTrigger }) => {
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const fetchSentEmails = async () => {
    try {
      setLoading(true);
      const data = await getSentEmails(scheduledEmailId);
      setSentEmails(data.sentEmails || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch sent emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchSentEmails();
    }
  }, [expanded, scheduledEmailId, refreshTrigger]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h2 className="card-title text-base-content">
            Sent Email History
            {sentEmails.length > 0 && (
              <span className="badge badge-primary">{sentEmails.length}</span>
            )}
          </h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {expanded && (
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            ) : sentEmails.length === 0 ? (
              <div className="text-center text-base-content/70 py-4">
                No sent emails found
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-base-200">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200 text-base-content font-bold uppercase text-xs tracking-wider">
                      <th>Recipient</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentEmails.map((email) => (
                      <tr key={email.id} className="hover">
                        <td className="font-medium text-base-content">{email.recipientEmail}</td>
                        <td className="text-base-content">
                          <div className="tooltip" data-tip={email.subject}>
                            <span className="opacity-90">
                            {email.subject.length > 40
                              ? email.subject.substring(0, 40) + '...'
                              : email.subject}
                            </span>
                          </div>
                        </td>
                        <td>
                          {email.status === 'sent' ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="badge badge-success badge-sm font-semibold uppercase tracking-wide">Sent</span>
                              {email.messageId && (
                                <span className="text-[10px] font-mono opacity-50 select-all">
                                  ID: {email.messageId.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1 items-start">
                              <span className="badge badge-error badge-sm font-semibold uppercase tracking-wide">Failed</span>
                              {email.error && (
                                <div className="tooltip tooltip-error" data-tip={email.error}>
                                  <span className="text-[10px] text-error font-bold cursor-help border-b border-error border-dashed">
                                    View Error
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-base-content/70 text-xs">
                          {formatDate(email.sentAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentEmailsHistory;
