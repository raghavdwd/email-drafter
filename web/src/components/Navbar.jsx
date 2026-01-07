import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar bg-base-100 border-b border-base-200 px-4 shadow-sm">
      {/* LEFT SIDE: Brand & Navigation */}
      <div className="navbar-start w-full md:w-auto flex-1">
        {/* Brand */}
        <a 
          className="btn btn-ghost text-xl font-bold normal-case mr-2"
          onClick={() => navigate('/dashboard')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-5a2 2-2H2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Drafter
        </a>

        {/* Desktop Links - inline with brand */}
        <div className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`btn btn-sm ${isActive('/dashboard') ? 'btn-primary' : 'btn-ghost text-base-content/70'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className={`btn btn-sm ${isActive('/profile') ? 'btn-primary' : 'btn-ghost text-base-content/70'}`}
          >
            Profile
          </button>
          <button 
            onClick={() => navigate('/variables-guide')}
            className={`btn btn-sm ${isActive('/variables-guide') ? 'btn-primary' : 'btn-ghost text-base-content/70'}`}
          >
            Variables
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Theme Toggle & User Menu */}
      <div className="navbar-end flex-none gap-2">
        <ThemeToggle />
        
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-base-300">
            <div className="w-10 rounded-full">
              <img 
                alt="user avatar" 
                src={user?.photo || "https://ui-avatars.com/api/?name=" + (user?.name || "User")} 
              />
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
            <li className="menu-title px-4 py-2 border-b border-base-200 mb-2">
                <span className="text-base-content font-semibold">{user?.name || 'User'}</span>
            </li>
            
            {/* Mobile links appear in dropdown */}
            <li className="md:hidden"><a onClick={() => navigate('/dashboard')}>Dashboard</a></li>
            <li className="md:hidden"><a onClick={() => navigate('/profile')}>Profile</a></li>
            <li className="md:hidden"><a onClick={() => navigate('/variables-guide')}>Variables Guide</a></li>
            
            <li><a onClick={handleLogout} className="text-error font-medium">Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
