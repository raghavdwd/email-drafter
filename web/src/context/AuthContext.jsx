import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

// auth provider component to manage authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // load user from session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.user) {
          setUser(res.data.user);
          // If admin logic is needed, handle likely via a separate role check or distinct endpoint
          if (res.data.user.role === 'admin') {
            setAdmin(res.data.user);
          }
        } else {
          console.log('No user data in response');
        }
      } catch (error) {
        // Not logged in or session expired
        console.log('No active session:', error.response?.status, error.response?.data);
        // Clear any stale state
        setUser(null);
        setAdmin(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // login function (mostly to update local state after successful auth)
  const login = (token, userData) => {
    if (token) {
      setToken(token);
      localStorage.setItem('token', token);
    }
    if (userData) {
      setUser(userData);
    }
  };

  // login function for admin
  const loginAdmin = (adminData) => {
    setAdmin(adminData);
  };

  // logout function
  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    }
    setToken(null);
    setUser(null);
    setAdmin(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        token,
        loading,
        login,
        loginAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
