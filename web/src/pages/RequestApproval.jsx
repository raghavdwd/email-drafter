import React from 'react';

// pending approval page for users waiting for admin approval
const RequestApproval = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="card-title text-base-content justify-center text-2xl mb-2">
            pending approval
          </h2>

          <p className="text-base-content mb-4">
            your account is pending approval. please wait for admin to approve
            your request.
          </p>

          <p className="text-base-content/70 text-sm">
            you will be able to access the dashboard once approved
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestApproval;
