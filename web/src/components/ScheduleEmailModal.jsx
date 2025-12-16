import React, { useState, useEffect } from 'react';

/**
 * Modal component to configure email scheduling
 */
const ScheduleEmailModal = ({ isOpen, onClose, onSend, rowCount }) => {
  const [intervalValue, setIntervalValue] = useState(30);
  const [intervalUnit, setIntervalUnit] = useState('seconds');
  const [confirmed, setConfirmed] = useState(false);

  // Calculate interval in seconds
  const intervalSeconds = intervalUnit === 'seconds' ? intervalValue :
                         intervalUnit === 'minutes' ? intervalValue * 60 :
                         intervalValue * 3600; // hours

  // Calculate estimated time
  const totalSeconds = (rowCount - 1) * intervalSeconds;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const estimatedTime = hours > 0 
    ? `${hours}h ${minutes}m` 
    : minutes > 0 
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;

  const handleSend = () => {
    if (!confirmed) {
      alert('Please confirm that you understand these emails will be sent immediately');
      return;
    }

    if (intervalSeconds < 10) {
      alert('Minimum interval is 10 seconds');
      return;
    }

    onSend(intervalSeconds);
  };

  useEffect(() => {
    if (!isOpen) {
      setConfirmed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open bg-black/50 backdrop-blur-sm">
      <div className="modal-box max-w-2xl border border-base-content/10 shadow-2xl">
        <h3 className="font-extrabold text-2xl text-base-content mb-6">
          Configure Email Sequence
        </h3>

        {/* Warning alert */}
        <div className="alert alert-warning mb-8 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-8 w-8"
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
          <div>
            <h3 className="font-bold text-lg">Important Safety Information</h3>
            <div className="text-sm opacity-90">
              <ul className="list-disc list-inside">
                <li>Gmail daily limits: <strong>500 (Free)</strong> or <strong>2000 (Workspace)</strong></li>
                <li>Emails are sent <strong>immediately</strong> and cannot be recalled</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interval configuration */}
        <div className="form-control w-full mb-8">
          <label className="label">
            <span className="label-text font-bold text-base-content">Time Interval Between Emails</span>
          </label>
          <div className="join w-full">
            <input
              type="number"
              min="1"
              value={intervalValue}
              onChange={(e) => setIntervalValue(parseInt(e.target.value) || 1)}
              className="input input-bordered join-item w-full"
            />
            <select
              value={intervalUnit}
              onChange={(e) => setIntervalUnit(e.target.value)}
              className="select select-bordered join-item min-w-[120px]"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>
          <label className="label">
            {intervalSeconds < 10 ? (
               <span className="label-text-alt text-error font-bold">Minimum interval is 10 seconds</span>
            ) : (
              <span className="label-text-alt opacity-60">Wait time between each email send</span>
            )}
          </label>
        </div>

        {/* Preview */}
        <div className="bg-base-200 rounded-box p-6 mb-8">
          <h4 className="font-bold text-sm uppercase tracking-wider opacity-60 mb-4">Sequence Preview</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">{rowCount}</div>
              <div className="text-xs font-bold opacity-60 uppercase">Total Emails</div>
            </div>
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-secondary mb-1">{intervalSeconds}s</div>
              <div className="text-xs font-bold opacity-60 uppercase">Interval</div>
            </div>
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-accent mb-1">{estimatedTime}</div>
              <div className="text-xs font-bold opacity-60 uppercase">Est. Duration</div>
            </div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <div className="form-control mb-8">
          <label className="label cursor-pointer justify-start gap-4 p-4 border border-warning/30 rounded-lg hover:bg-warning/5 transition-colors">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="checkbox checkbox-warning checkbox-lg"
            />
            <span className="label-text font-medium leading-tight">
              I understand that these emails will be sent <strong>immediately</strong> and cannot be reverted once sent.
            </span>
          </label>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!confirmed || intervalSeconds < 10}
            className="btn btn-warning gap-2"
          >
            Start Sending Sequence
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default ScheduleEmailModal;
