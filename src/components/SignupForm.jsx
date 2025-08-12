import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LoginForm.css';

const SignupForm = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const result = await signup(email, password, name);
    
    if (!result.success) {
      // Provide better error messages for common cases
      if (result.error && result.error.includes('User already exists')) {
        setError('An account with this email already exists. Please try logging in instead.');
      } else {
        setError(result.error || 'Signup failed');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your password"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {error && error.includes('already exists') && (
          <div className="info-message">
            <p>Already have an account? Try logging in instead!</p>
            <button type="button" onClick={onSwitchToLogin} className="switch-button">
              Switch to Login
            </button>
          </div>
        )}

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="switch-button">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm; 