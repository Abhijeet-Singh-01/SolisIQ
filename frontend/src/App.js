import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import AdminLoginPage from './AdminLoginPage';
import DashboardPage from './DashboardPage';
import AdminDashboardPage from './AdminDashboardPage';
import ProtectedRoute from './ProtectedRoute';
import HomePage from './HomePage';
import SubsidyCheckerPage from './SubsidyCheckerPage';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('solisiq_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('solisiq_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('solisiq_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  const handleLogin = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('solisiq_token', jwtToken);
    localStorage.setItem('solisiq_user', JSON.stringify(userData));
  };

  const handleAdminLogin = (jwtToken) => {
    const adminData = { username: 'Admin', email: 'admin@solisiq.local', isAdmin: true };
    setToken(jwtToken);
    setUser(adminData);
    localStorage.setItem('solisiq_token', jwtToken);
    localStorage.setItem('solisiq_user', JSON.stringify(adminData));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('solisiq_token');
    localStorage.removeItem('solisiq_user');
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('solisiq_dark_mode', String(next));
      return next;
    });
  };

  return (
    <div className={darkMode ? 'dark-theme' : 'light-theme'}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                token={token}
                user={user}
                onLogout={handleLogout}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />
          <Route
            path="/calculator"
            element={
              <DashboardPage
                token={token}
                user={user}
                onLogout={handleLogout}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                onLogin={handleLogin}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <SignupPage
                onSignup={() => {}}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />
          <Route
            path="/admin/login"
            element={
              <AdminLoginPage
                onAdminLogin={handleAdminLogin}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />
          <Route
            path="/subsidy-checker"
            element={
              <SubsidyCheckerPage
                token={token}
                user={user}
                onLogout={handleLogout}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute token={token}>
                <DashboardPage
                  token={token}
                  user={user}
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute token={token} requireAdmin>
                <AdminDashboardPage
                  token={token}
                  user={user}
                  onLogout={handleLogout}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
