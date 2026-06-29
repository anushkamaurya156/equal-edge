import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <div className="container flex align-center justify-between" style={{ padding: '1rem 0' }}>
        {/* Brand */}
        <div className="navbar-brand">
          <Link
            to="/"
            style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>♿</span> सक्षम Hire
          </Link>
        </div>

        {/* Nav links */}
        <nav className="navbar-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              {/* Role-specific links */}
              {role === 'jobseeker' ? (
                <>
                  <Link to="/jobseeker/dashboard">Dashboard</Link>
                  <Link to="/jobseeker/profile">My Profile</Link>
                  <Link to="/jobseeker/settings">Settings</Link>
                </>
              ) : (
                <>
                  <Link to="/employer/dashboard">Dashboard</Link>
                  <Link to="/employer/post-job">Post Job</Link>
                  <Link to="/employer/settings">Settings</Link>
                </>
              )}

              {/* Greeting – shows the real name from the stored user object */}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Hi, <strong>{user?.name || 'User'}</strong>{' '}
                ({role === 'jobseeker' ? 'Seeker' : 'Employer'})
              </span>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Log Out
              </button>
            </>
          ) : (
            <>
              {/* Home is only visible when logged OUT */}
              <Link to="/">Home</Link>
              <Link to="/login">Sign In</Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                style={{ color: 'var(--bg)' }}
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
