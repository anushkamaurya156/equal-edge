import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('jobseeker'); // Default to jobseeker
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(name, email, password, role);
      // Auto-login after registration — no redirect to /login needed
      login(data.user, data.token);
      if (data.user.role === 'jobseeker') {
        navigate('/jobseeker/dashboard');
      } else {
        navigate('/employer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', padding: '4rem 0' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Custom Card Role Selector */}
          <div className="form-group">
            <span className="form-label">I want to join as a:</span>
            <div className="role-cards">
              <div
                className={`role-card ${role === 'jobseeker' ? 'active' : ''}`}
                onClick={() => setRole('jobseeker')}
                role="button"
                tabIndex="0"
                aria-label="Register as Job Seeker"
                onKeyDown={(e) => { if (e.key === 'Enter') setRole('jobseeker'); }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👨‍💼</div>
                <strong style={{ display: 'block' }}>Job Seeker</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Find accessible jobs</span>
              </div>
              <div
                className={`role-card ${role === 'employer' ? 'active' : ''}`}
                onClick={() => setRole('employer')}
                role="button"
                tabIndex="0"
                aria-label="Register as Employer"
                onKeyDown={(e) => { if (e.key === 'Enter') setRole('employer'); }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏢</div>
                <strong style={{ display: 'block' }}>Employer</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Post jobs and recruit PwD</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', color: 'var(--bg)' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0, fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Sign In here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
