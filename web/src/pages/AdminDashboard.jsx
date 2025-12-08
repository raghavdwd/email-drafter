import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// admin dashboard with user approval table
const AdminDashboard = () => {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.error || 'failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/approve/${userId}`);
      // refresh user list
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'failed to approve user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* navbar */}
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-base-content">
            admin dashboard
          </a>
        </div>
        <div className="flex-none">
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            logout
          </button>
        </div>
      </div>

      {/* main content */}
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-base-content mb-6">
          user management
        </h1>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-base-200 rounded-lg shadow-xl">
            <table className="table">
              <thead>
                <tr className="text-base-content">
                  <th>name</th>
                  <th>email</th>
                  <th>signup date</th>
                  <th>status</th>
                  <th>action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-base-content/70">
                      no users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover">
                      <td className="text-base-content">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle h-12 w-12">
                              <img src={user.photo} alt={user.name} />
                            </div>
                          </div>
                          <div>{user.name}</div>
                        </div>
                      </td>
                      <td className="text-base-content">{user.email}</td>
                      <td className="text-base-content">
                        {formatDate(user.createdAt)}
                      </td>
                      <td>
                        {user.status === 'approved' ? (
                          <span className="badge badge-success">approved</span>
                        ) : (
                          <span className="badge badge-warning">pending</span>
                        )}
                      </td>
                      <td>
                        {user.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="btn btn-success btn-sm"
                          >
                            approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
