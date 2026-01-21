import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

// auth provider component to manage authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check for token in localStorage first
      const storedToken = localStorage.getItem("token");

      // Also check URL for token (from OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get("token");

      // Use token from URL if available, otherwise use stored token
      const token = urlToken || storedToken;

      if (token) {
        // Store token if it came from URL
        if (urlToken) {
          localStorage.setItem("token", urlToken);
          setToken(urlToken);
          // Remove token from URL
          window.history.replaceState({}, "", window.location.pathname);
        } else {
          setToken(token);
        }

        // Verify token and get user data
        try {
          // Token is automatically sent via Authorization header by API interceptor
          const res = await api.get("/auth/me");
          if (res.data && res.data.user) {
            setUser(res.data.user);
            if (res.data.user.role === "admin") {
              setAdmin(res.data.user);
            }
          }
        } catch (error) {
          // Token invalid or expired
          console.log(
            "Token verification failed:",
            error.response?.status,
            error.response?.data,
          );
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setAdmin(null);
        }
      }

      setLoading(false);
    };
    checkAuth();
  }, []);

  // login function (mostly to update local state after successful auth)
  const login = (token, userData) => {
    if (token) {
      setToken(token);
      localStorage.setItem("token", token);
    }
    if (userData) {
      setUser(userData);
    }
  };

  // login function for admin
  const loginAdmin = (adminData, token) => {
    if (token) {
      setToken(token);
      localStorage.setItem("token", token);
    }
    if (adminData) {
      setAdmin(adminData);
    }
  };

  // logout function
  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
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
