import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

// admin login page with email and password
const AdminLogin = () => {
  const { loginAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/admin/login', {
        email,
        password,
      });

      // Store token and admin data
      loginAdmin(response.data.admin, response.data.token);
      
      // Verify token and get admin data to ensure state is set
      try {
        const meResponse = await api.get('/auth/me');
        if (meResponse.data && meResponse.data.user) {
          loginAdmin(meResponse.data.user, response.data.token);
        }
      } catch (meErr) {
        console.error('Failed to verify admin token:', meErr);
      }
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-100 shadow-2xl border border-base-content/10">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl font-bold mb-6 text-base-content">
            Admin Login
          </h2>

          {error && (
            <div className="alert alert-error mb-4 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-base-content">Email</span>
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="input input-bordered bg-base-200 text-base-content focus:border-primary focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium text-base-content">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="input input-bordered bg-base-200 text-base-content focus:border-primary focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary text-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          <div className="divider text-base-content/20">OR</div>

          <button
            className="btn btn-ghost btn-sm w-full"
            onClick={() => navigate('/')}
          >
            User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
