import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowRight, Sparkles, User, LogOut, ShieldCheck } from 'lucide-react';

function Navbar({ token, user, onLogout, darkMode, toggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (target) => {
    if (target.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/' + target);
      } else {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(target);
    }
  };

  return (
    <header className={`solis-navbar-wrap ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="solis-navbar">
        {/* Brand */}
        <Link to="/" className="solis-brand">
          <div className="solis-logo-icon">
            <Sun className="brand-sun-icon" size={20} />
            <div className="brand-sun-glow" />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">SolisIQ</span>
            <span className="brand-badge">AI</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="solis-nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/calculator" className={`nav-link ${location.pathname === '/calculator' ? 'active' : ''}`}>
            Solar Advisor
          </Link>
          <button
            type="button"
            onClick={() => handleNavClick('#how-it-works')}
            className="nav-link nav-btn-link"
          >
            How It Works
          </button>
          <Link to="/subsidy-checker" className={`nav-link ${location.pathname === '/subsidy-checker' ? 'active' : ''}`}>
            Subsidies
          </Link>
          <button
            type="button"
            onClick={() => handleNavClick('#community')}
            className="nav-link nav-btn-link"
          >
            Community
          </button>
        </nav>

        {/* Right CTA / Controls */}
        <div className="solis-nav-actions">
          {toggleDarkMode && (
            <button
              type="button"
              className="solis-icon-btn theme-toggle-btn"
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

          {token ? (
            <div className="user-menu-pill">
              <Link to="/dashboard" className="user-link">
                <User size={15} />
                <span>{user?.username || 'Dashboard'}</span>
              </Link>
              {user?.isAdmin && (
                <Link to="/admin/dashboard" className="admin-chip" title="Admin Dashboard">
                  <ShieldCheck size={14} />
                </Link>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="nav-logout-btn"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={15} />
                </button>
              )}
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="nav-login-link">
                Login
              </Link>
              <button
                type="button"
                className="solis-btn solis-btn-primary nav-cta-btn"
                onClick={() => navigate('/calculator')}
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="solis-hamburger-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="solis-mobile-menu">
          <Link to="/" className="mobile-nav-link">
            Home
          </Link>
          <Link to="/calculator" className="mobile-nav-link">
            Solar Advisor Calculator
          </Link>
          <button
            type="button"
            onClick={() => handleNavClick('#how-it-works')}
            className="mobile-nav-link mobile-btn-link"
          >
            How It Works
          </button>
          <Link to="/subsidy-checker" className="mobile-nav-link">
            State Subsidies
          </Link>
          <button
            type="button"
            onClick={() => handleNavClick('#community')}
            className="mobile-nav-link mobile-btn-link"
          >
            Community Insights
          </button>

          <div className="mobile-menu-divider" />

          {token ? (
            <div className="mobile-user-actions">
              <Link to="/dashboard" className="mobile-nav-link highlight">
                <User size={16} />
                <span>Dashboard ({user?.username})</span>
              </Link>
              {onLogout && (
                <button type="button" onClick={onLogout} className="mobile-logout-btn">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mobile-auth-actions">
              <Link to="/login" className="solis-btn solis-btn-ghost mobile-btn">
                Login
              </Link>
              <button
                type="button"
                className="solis-btn solis-btn-primary mobile-btn"
                onClick={() => navigate('/calculator')}
              >
                <span>Analyze Rooftop</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
