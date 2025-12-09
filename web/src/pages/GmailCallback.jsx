import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Gmail OAuth callback page
const GmailCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      setStatus('success');
      // redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setStatus('error');
      setErrorMessage(error || 'Unknown error occurred');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card bg-base-200 shadow-xl w-96">
        <div className="card-body items-center text-center">
          {status === 'processing' && (
            <>
              <span className="loading loading-spinner loading-lg"></span>
              <h2 className="card-title text-base-content mt-4">
                Connecting Gmail...
              </h2>
              <p className="text-base-content/70">Please wait</p>
            </>
          )}

          {status === 'success' && (
            <>
              <svg
                className="w-16 h-16 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="card-title text-base-content mt-4">
                Gmail Connected!
              </h2>
              <p className="text-base-content/70">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <svg
                className="w-16 h-16 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <h2 className="card-title text-base-content mt-4">
                Connection Failed
              </h2>
              <p className="text-base-content/70">{errorMessage}</p>
              <div className="card-actions mt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary"
                >
                  Back to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GmailCallback;
