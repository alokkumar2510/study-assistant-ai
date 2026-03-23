/**
 * src/context/AuthContext.jsx
 * ---------------------------
 * React context for authentication state.
 * Stores JWT token in localStorage, provides user info, login/logout/register helpers.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("prepify_token"));
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(true);

  // Fetch current user info whenever token changes
  const fetchMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setUsage(res.data.usage || 0);
      setLimit(res.data.limit || 100);
    } catch {
      // Token invalid — clear
      localStorage.removeItem("prepify_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Set up axios interceptor so every request includes the JWT
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      const t = localStorage.getItem("prepify_token");
      if (t) {
        config.headers.Authorization = `Bearer ${t}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("prepify_token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("prepify_token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("prepify_token");
    setToken(null);
    setUser(null);
    setUsage(0);
  };

  const refreshUsage = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        usage,
        limit,
        loading,
        login,
        register,
        logout,
        refreshUsage,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
