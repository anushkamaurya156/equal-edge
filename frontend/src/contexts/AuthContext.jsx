import React, { createContext, useContext, useState } from 'react';

// ─── Context & hook ──────────────────────────────────────────────────────────

export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

// ─── Helper: read the saved user object from localStorage ────────────────────

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  // Initialise from localStorage so a page-refresh keeps the user logged in
  const [user, setUser] = useState(readStoredUser);

  /**
   * login(userData, token)
   * userData shape: { id, name, email, role }
   * Saves both to localStorage and to React state.
   */
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  /**
   * logout()
   * Clears localStorage and React state.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!user;
  const role = user ? user.role : null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, role, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};
