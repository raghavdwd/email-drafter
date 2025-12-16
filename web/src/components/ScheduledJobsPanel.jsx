import React, { useEffect, useState } from 'react';
import { getScheduledJobs, pauseScheduledJob, resumeScheduledJob, cancelScheduledJob } from '../utils/emailApi';

/**
 * Component to display and manage scheduled email jobs
 */
const ScheduledJobsPanel = ({ refreshTrigger }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getScheduledJobs();
      setJobs(data.jobs || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch scheduled jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handlePause = async (jobId) => {
    try {
      await pauseScheduledJob(jobId);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to pause job');
    }
  };

  const handleResume = async (jobId) => {
    try {
      await resumeScheduledJob(jobId);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resume job');
    }
  };

  const handleCancel = async (jobId) => {
    if (!confirm('Are you sure you want to cancel this job? Remaining emails will not be sent.')) {
      return;
    }

    try {
      await cancelScheduledJob(jobId);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel job');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-info',
      in_progress: 'badge-primary',
      paused: 'badge-warning',
      completed: 'badge-success',
      cancelled: 'badge-error',
      failed: 'badge-error',
    };
    return badges[status] || 'badge-ghost';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center text-base-content/70 py-8">
        No scheduled email jobs found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-base-200">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-base-200 text-base-content font-bold uppercase text-xs tracking-wider">
            <th>Status</th>
            <th>Progress</th>
            <th>Interval</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="hover">
              <td>
                <span className={`badge ${getStatusBadge(job.status)} badge-sm font-semibold uppercase tracking-wide`}>
                  {job.status.replace('_', ' ')}
                </span>
              </td>
              <td className="text-base-content">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col w-24">
                     <progress
                      className="progress progress-primary w-full h-2"
                      value={job.currentIndex}
                      max={job.totalCount}
                    ></progress>
                  </div>
                  <div className="text-xs font-mono opacity-70">
                    {job.currentIndex}/{job.totalCount}
                  </div>
                </div>
              </td>
              <td className="text-base-content font-mono text-sm">{job.timeIntervalSeconds}s</td>
              <td className="text-base-content/70 text-xs">
                {formatDate(job.createdAt)}
              </td>
              <td>
                <div className="flex gap-2">
                  {job.status === 'in_progress' && (
                    <button
                      onClick={() => handlePause(job.id)}
                      className="btn btn-xs btn-warning btn-outline"
                    >
                      Pause
                    </button>
                  )}
                  {job.status === 'paused' && (
                    <button
                      onClick={() => handleResume(job.id)}
                      className="btn btn-xs btn-primary btn-outline"
                    >
                      Resume
                    </button>
                  )}
                  {(job.status === 'in_progress' || job.status === 'paused' || job.status === 'pending') && (
                    <button
                      onClick={() => handleCancel(job.id)}
                      className="btn btn-xs btn-error btn-outline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduledJobsPanel;
