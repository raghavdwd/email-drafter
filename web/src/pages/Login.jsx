import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

// user login page with google oauth
const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
      });

      if (response.data.status === 'pending') {
        // user is pending approval
        navigate('/request-approval');
      } else if (response.data.status === 'approved') {
        // user is approved, login and redirect to dashboard
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('google login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-base-content justify-center text-2xl mb-4">
            email drafter
          </h2>
          <p className="text-base-content text-center mb-6">
            sign in with google to continue
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : (
          <div className="flex justify-center">
            <button
              className="btn btn-primary btn-wide"
              onClick={() => window.location.href = `${api.defaults.baseURL}/auth/google`}
            >
              Sign in with Google
            </button>
          </div>
          )}

          <div className="divider text-base-content">or</div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin')}
          >
            admin login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
