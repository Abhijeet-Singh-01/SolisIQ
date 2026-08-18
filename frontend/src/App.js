import React, { useState } from 'react';
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('solisiq_dark_mode') === 'true');

  const handleLogin = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('solisiq_token', jwtToken);
    localStorage.setItem('solisiq_user', JSON.stringify(userData));
  };

  const handleAdminLogin = (jwtToken) => {
    const adminData = { username: 'Admin', email: 'admin@solisiq.local' };
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
    <div className={darkMode ? 'dark-theme' : ''}>
      <Router>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={
            <DashboardPage
              token={token}
              user={user}
              onLogout={handleLogout}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
        } />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignupPage onSignup={() => {}} />} />
        <Route path="/admin/login" element={<AdminLoginPage onAdminLogin={handleAdminLogin} />} />
        <Route path="/subsidy-checker" element={<SubsidyCheckerPage />} />
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
