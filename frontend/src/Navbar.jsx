import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, ArrowRight, User, LogOut, ShieldCheck } from 'lucide-react';

function Navbar({ token, user, onLogout, darkMode, toggleDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 16) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <Link to="/" className="solis-brand" aria-label="SolisIQ Home">
          <span className="brand-dot" aria-hidden="true" />
          <span className="brand-title">SolisIQ</span>
          <span className="brand-mono-badge">AI</span>
        </Link>

        {/* Center Editorial Navigation */}
        <nav className="solis-nav-links" aria-label="Main Navigation">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/calculator"
            className={`nav-link ${location.pathname === '/calculator' ? 'active' : ''}`}
          >
            Solar Advisor
          </Link>
          <Link
            to="/subsidy-checker"
            className={`nav-link ${location.pathname === '/subsidy-checker' ? 'active' : ''}`}
          >
            Subsidies
          </Link>
          <button
            type="button"
            onClick={() => handleNavClick('#how-it-works')}
            className="nav-link nav-btn-link"
          >
            Methodology
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('#workflow')}
            className="nav-link nav-btn-link"
          >
            Intelligence
          </button>
        </nav>

        {/* Right CTA / Controls */}
        <div className="solis-nav-actions">
          {toggleDarkMode && (
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}

          {token ? (
            <div className="user-nav-group">
              <Link to="/calculator" className="user-pill-link" title="Open Solar Dashboard">
                <User size={14} />
                <span>{user?.username || 'Console'}</span>
              </Link>
              {user?.isAdmin && (
                <Link to="/admin/dashboard" className="admin-pill-link" title="Admin Console">
                  <ShieldCheck size={14} />
                  <span>Admin</span>
                </Link>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="nav-logout-btn"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="guest-nav-group">
              <Link to="/login" className="nav-text-link">
                Sign in
              </Link>
              <button
                type="button"
                className="solis-btn solis-btn-primary nav-cta-btn"
                onClick={() => navigate('/calculator')}
              >
                <span>Explore Solar Potential</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="solis-hamburger-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="solis-mobile-menu">
          <Link to="/" className="mobile-nav-link">
            Home
          </Link>
          <Link to="/calculator" className="mobile-nav-link">
            Solar Advisor
          </Link>
          <Link to="/subsidy-checker" className="mobile-nav-link">
            State Subsidies
          </Link>
          <button
            type="button"
            onClick={() => handleNavClick('#how-it-works')}
            className="mobile-nav-link mobile-btn-link"
          >
            Methodology
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('#workflow')}
            className="mobile-nav-link mobile-btn-link"
          >
            Intelligence
          </button>

          <div className="mobile-menu-divider" />

          {token ? (
            <div className="mobile-user-actions">
              <Link to="/calculator" className="mobile-nav-link highlight">
                <User size={15} />
                <span>Console ({user?.username})</span>
              </Link>
              {user?.isAdmin && (
                <Link to="/admin/dashboard" className="mobile-nav-link">
                  <ShieldCheck size={15} />
                  <span>Admin Console</span>
                </Link>
              )}
              {onLogout && (
                <button type="button" onClick={onLogout} className="mobile-logout-btn">
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mobile-auth-actions">
              <Link to="/login" className="solis-btn solis-btn-ghost mobile-btn">
                Sign In
              </Link>
              <button
                type="button"
                className="solis-btn solis-btn-primary mobile-btn"
                onClick={() => navigate('/calculator')}
              >
                <span>Explore Solar Potential</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
