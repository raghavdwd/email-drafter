import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import AboutDev from './pages/AboutDev';
import RequestApproval from './pages/RequestApproval';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import VariablesGuide from './pages/VariablesGuide';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminVariables from './pages/admin/AdminVariables';
import GmailCallback from './pages/GmailCallback';
import PreAuth from './components/PreAuth';
import {
  ProtectedUserRoute,
  ProtectedAdminRoute,
} from './components/ProtectedRoute';

const App = () => {
  const [isPreAuthenticated, setIsPreAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const preAuth = localStorage.getItem('preAuthenticated');
    if (preAuth === 'true') {
      setIsPreAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleAuthenticated = () => {
    setIsPreAuthenticated(true);
  };

  const handlePreAuthLogout = () => {
    localStorage.removeItem('preAuthenticated');
    setIsPreAuthenticated(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!isPreAuthenticated) {
    return <PreAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 group">
        <button
          onClick={handlePreAuthLogout}
          className="btn btn-circle btn-sm md:btn-md btn-neutral opacity-30 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl"
          aria-label="Lock Website"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-neutral text-neutral-content text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Lock access
        </div>
      </div>
      <BrowserRouter>
        <Routes>
        {/* user routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about-dev" element={<AboutDev />} />
        <Route path="/login" element={<Login />} />
        <Route path="/request-approval" element={<RequestApproval />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedUserRoute>
              <Dashboard />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedUserRoute>
              <Profile />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/variables-guide"
          element={
            <ProtectedUserRoute>
              <VariablesGuide />
            </ProtectedUserRoute>
          }
        />
        <Route path="/gmail-callback" element={<GmailCallback />} />

        {/* admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          {/* Nested Dashboard Routes */}
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="variables" element={<AdminVariables />} />
        </Route>

        {/* catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;

