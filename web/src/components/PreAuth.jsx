import React, { useState } from 'react';
import api from '../utils/api';

const PreAuth = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/pre-auth', { password });
      
      if (response.data.success) {
        localStorage.setItem('preAuthenticated', 'true');
        onAuthenticated();
      } else {
        // Clear password on error
        setPassword('');
        setError('Incorrect access code. Please try again.');
      }
    } catch (err) {
      setError('Authentication failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-100 overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="card w-full max-w-md bg-base-100/80 backdrop-blur-xl shadow-2xl border border-base-content/5 z-10 transition-all duration-300 hover:shadow-primary/20 hover:scale-[1.01]">
        <div className="card-body p-8 items-center text-center">
          
          <div className="mb-6 p-4 bg-primary/10 rounded-full ring-1 ring-primary/20 text-primary animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="card-title text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Restricted Access
          </h2>
          <p className="text-base-content/60 mb-8 font-medium">
            This deployment is protected. <br/>Please enter the access code to continue.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="form-control w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${error ? 'text-error' : 'text-base-content/40 group-focus-within:text-primary'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Enter Access Code"
                  className={`input input-bordered w-full pl-10 h-12 bg-base-200/50 focus:bg-base-100 transition-all duration-300 ${
                    error 
                      ? 'input-error animate-shake' 
                      : 'focus:input-primary'
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="label pb-0 pt-2 justify-center">
                  <span className="label-text-alt text-error font-semibold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full h-12 text-lg font-bold uppercase tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Verifying Identity...' : 'Unlock Access'}
            </button>
          </form> 
          
          <div className="mt-8 text-xs text-base-content/30 flex items-center justify-center gap-1 font-mono">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            SECURE ENVIRONMENT
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreAuth;