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

      loginAdmin(response.data.admin, response.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-base-content justify-center text-2xl mb-4">
            admin login
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-base-content">email</span>
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="input input-bordered bg-base-300 text-base-content"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text text-base-content">password</span>
              </label>
              <input
                type="password"
                placeholder="enter password"
                className="input input-bordered bg-base-300 text-base-content"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'login'
                )}
              </button>
            </div>
          </form>

          <div className="divider text-base-content">or</div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/')}
          >
            user login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
