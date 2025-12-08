import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// user dashboard for approved users
const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* navbar */}
      <div className="navbar bg-base-200">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl text-base-content">
            email drafter
          </a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img alt="user avatar" src={user?.photo} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <a className="justify-between text-base-content">
                  {user?.name}
                  <span className="badge badge-success">approved</span>
                </a>
              </li>
              <li>
                <a onClick={handleLogout} className="text-base-content">
                  logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="container mx-auto p-8">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-base-content text-3xl mb-4">
              welcome, {user?.name}!
            </h2>
            <p className="text-base-content/80 text-lg">
              tool will appear here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
