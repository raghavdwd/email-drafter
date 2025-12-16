import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import AboutDev from './pages/AboutDev';
import RequestApproval from './pages/RequestApproval';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTemplates from './pages/admin/AdminTemplates';
import GmailCallback from './pages/GmailCallback';
import {
  ProtectedUserRoute,
  ProtectedAdminRoute,
} from './components/ProtectedRoute';

const App = () => {
  return (
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
        </Route>

        {/* catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

