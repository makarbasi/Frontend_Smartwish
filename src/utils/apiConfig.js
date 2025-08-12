/**
 * Centralized API configuration for both development and production
 * This ensures consistent API URL handling across all components
 */

// Get the API base URL based on environment
export const getApiBaseUrl = () => {
  // Priority 1: Use VITE_API_URL if explicitly set (for production)
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Priority 2: Check if we're in development mode
  const isDevelopment = import.meta.env.DEV || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    // Development: Backend runs on port 3000
    return 'http://localhost:3000';
  }

  // Priority 3: Production environment detection
  const hostname = window.location.hostname;
  
  // Render.com deployment
  if (hostname.includes('onrender.com')) {
    // Frontend and backend are on the same domain in Render
    return `${window.location.protocol}//${hostname}`;
  }
  
  // SmartWish production domain
  if (hostname.includes('smartwish.us') || hostname.includes('smartwish.com')) {
    return process.env.VITE_PRODUCTION_URL || 'https://app.smartwish.us';
  }
  
  // Default fallback for other production domains
  return `${window.location.protocol}//${hostname}`;
};

// Get the full API URL for a specific endpoint
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  PUBLISHED_DESIGNS: 'saved-designs/published/all',
  SAVE_DESIGN: 'saved-designs',
  SAVE_IMAGES_CLOUD: 'save-images-cloud',
  USER_PROFILE: 'user/profile',
  AUTH_LOGIN: 'auth/login',
  AUTH_SIGNUP: 'auth/signup',
};

// Debug logging (only in development)
export const logApiConfig = () => {
  if (import.meta.env.DEV) {
    console.log('🔧 API Configuration:');
    console.log('  - Environment:', import.meta.env.MODE);
    console.log('  - Base URL:', getApiBaseUrl());
    console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('  - Hostname:', window.location.hostname);
  }
};
