// Centralized API utility functions

// Utility function to get base URL based on environment
export const getBaseUrl = () => {
  // Use VITE_API_URL if defined (highest priority)
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to environment detection
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    return `${window.location.protocol}//${window.location.hostname}:${window.location.port || 5173}`;
  } else {
    // Check if we're on Render.com
    if (window.location.hostname.includes('onrender.com')) {
      return `${window.location.protocol}//${window.location.hostname}`;
    } else {
      return import.meta.env.VITE_PRODUCTION_URL || 'https://app.smartwish.us';
    }
  }
};

// Utility function for making API calls with proper error handling
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};
