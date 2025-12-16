import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            fetchUsers();
            setSuccess('User approved successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'failed to approve user');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await api.delete(`/admin/user/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
            setSuccess('User deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'failed to delete user');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-base-content/60">Manage user access and approvals.</p>
                 </div>
                 <div className="badge badge-lg">{users.length} Total Users</div>
            </div>

            {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}
            {success && <div className="alert alert-success mb-4"><span>{success}</span></div>}

            {loading ? (
                <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg"></span></div>
            ) : (
                <div className="overflow-x-auto bg-base-100 border border-base-content/10 rounded-lg shadow-xl">
                    <table className="table table-lg">
                        <thead className="bg-base-200/50">
                            <tr>
                                <th>User</th>
                                <th>Contact Info</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-8 text-base-content/60">No users found</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{user.name}</div>
                                                    <div className="text-xs opacity-50">ID: {String(user.id).substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-mono text-sm">{user.email}</div>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            {user.status === 'approved' ? 
                                                <span className="badge badge-success badge-outline gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-success"></span> Approved
                                                </span> 
                                                : 
                                                <span className="badge badge-warning badge-outline gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-warning"></span> Pending
                                                </span>
                                            }
                                        </td>
                                        <td>
                                            {user.status === 'pending' && (
                                                <button onClick={() => handleApprove(user.id)} className="btn btn-success btn-sm btn-outline gap-2 mr-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    Approve
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(user.id)} className="btn btn-error btn-sm btn-outline gap-2 tooltip" data-tip="Delete User">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
