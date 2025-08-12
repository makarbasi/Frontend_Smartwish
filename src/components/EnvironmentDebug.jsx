import React from 'react';

const EnvironmentDebug = ({ user, loading, showAuthForm }) => {
  if (import.meta.env.MODE === 'development') {
    return (
      <div style={{
        position: 'fixed',
        top: '50px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9998,
        maxWidth: '200px'
      }}>
        <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
        <div><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</div>
        <div><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</div>
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Auth Form:</strong> {showAuthForm}</div>
      </div>
    );
  }
  
  return null;
};

export default EnvironmentDebug; 