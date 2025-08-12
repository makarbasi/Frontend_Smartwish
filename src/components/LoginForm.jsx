import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/LanguageContext.jsx';
import '../styles/LoginForm.css';

const LoginForm = ({ onSwitchToSignup }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || t('loginFailed'));
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-form-container">
      <h2>{t('login')}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">{t('email')}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('enterYourEmail')}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{t('password')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={t('enterYourPassword')}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? t('loggingIn') : t('login')}
        </button>
      </form>

      <div className="social-login-buttons">
        <button 
          className="social-btn google-btn" 
          type="button" 
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/google`}
        >
          <img src="/images/Google__G__logo.svg.png" alt="Google" className="social-icon" />
          {t('signInWithGoogle')}
        </button>
        <button 
          className="social-btn instagram-btn" 
          type="button" 
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/instagram`}
        >
          <img src="/images/Instagram_logo_.svg.png" alt="Instagram" className="social-icon" />
          {t('signInWithInstagram')}
        </button>
        <button 
          className="social-btn whatsapp-btn" 
          type="button" 
          onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/whatsapp`}
        >
          <img src="/images/whatsapp-logo.svg" alt="WhatsApp" className="social-icon" />
          {t('signInWithWhatsApp')}
        </button>
      </div>

      <div className="auth-switch">
        <p>
          {t('dontHaveAccount')}{' '}
          <button type="button" onClick={onSwitchToSignup} className="switch-button">
            {t('signup')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 