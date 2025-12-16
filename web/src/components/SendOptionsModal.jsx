import React from 'react';

/**
 * Modal component to choose between creating drafts or sending emails
 */
const SendOptionsModal = ({ isOpen, onClose, onSelectDraft, onSelectSend }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open bg-black/50 backdrop-blur-sm">
      <div className="modal-box max-w-2xl border border-base-content/10 shadow-2xl">
        <h3 className="font-exrabold text-2xl text-base-content mb-2 text-center">
          Choose Your Strategy
        </h3>
        
        <p className="text-base-content/60 mb-8 text-center text-lg">
          How would you like to process these emails?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Draft option */}
          <div
            onClick={onSelectDraft}
            className="group card bg-base-100 border-2 border-base-200 hover:border-primary cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="card-body items-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h4 className="card-title text-xl mb-2">Generate Drafts</h4>
              <p className="text-sm text-base-content/60 mb-4">
                Create Gmail drafts for manual review. Best for personalized edits before sending.
              </p>
              <div className="badge badge-success badge-outline">Recommended for Safety</div>
            </div>
          </div>

          {/* Send option */}
          <div
            onClick={onSelectSend}
            className="group card bg-base-100 border-2 border-base-200 hover:border-warning cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="card-body items-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-warning"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <h4 className="card-title text-xl mb-2">Send Automatically</h4>
              <p className="text-sm text-base-content/60 mb-4">
                Schedule emails to be sent automatically with a time delay.
              </p>
              <div className="badge badge-warning badge-outline">Advanced</div>
            </div>
          </div>
        </div>

        <div className="modal-action justify-center">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel Operation
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default SendOptionsModal;
