import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/TokenStatus.css';

const TokenStatus = () => {
  const { tokenExpiry, isTokenExpired, refreshToken } = useAuth();
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const updateTimeUntilExpiry = () => {
      if (!tokenExpiry) {
        setTimeUntilExpiry(null);
        return;
      }

      const now = Date.now();
      const timeLeft = tokenExpiry - now;
      
      if (timeLeft <= 0) {
        setTimeUntilExpiry('Expired');
      } else {
        const minutes = Math.floor(timeLeft / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setTimeUntilExpiry(`${minutes}m ${seconds}s`);
      }
    };

    updateTimeUntilExpiry();
    const interval = setInterval(updateTimeUntilExpiry, 1000);

    return () => clearInterval(interval);
  }, [tokenExpiry]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshToken();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!tokenExpiry) {
    return null; // Don't show if no token
  }

  const isExpired = isTokenExpired(localStorage.getItem('token'));
  const isExpiringSoon = timeUntilExpiry && timeUntilExpiry !== 'Expired' && 
    parseInt(timeUntilExpiry.split('m')[0]) < 5; // Less than 5 minutes

  return (
    <div className={`token-status ${isExpired ? 'expired' : isExpiringSoon ? 'expiring-soon' : 'valid'}`}>
      <div className="token-info">
        <span className="token-label">Session:</span>
        <span className="token-time">
          {isExpired ? 'Expired' : timeUntilExpiry}
        </span>
      </div>
      {(isExpired || isExpiringSoon) && (
        <button 
          className="refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  );
};

export default TokenStatus; 