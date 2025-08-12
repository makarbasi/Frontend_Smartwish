import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Check if token is expired or will expire soon (within 5 minutes)
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const expiryTime = decoded.exp;
      const fiveMinutesFromNow = currentTime + (5 * 60); // 5 minutes buffer
      
      return expiryTime < fiveMinutesFromNow;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Get token expiry time
  const getTokenExpiry = (token) => {
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const currentToken = localStorage.getItem('token');
      
      if (!currentToken) {
        throw new Error('No token found');
      }

      // Use the refresh endpoint instead of re-logging in
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setTokenExpiry(getTokenExpiry(data.access_token));
      
      console.log('Token refreshed successfully');
      return data.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, force logout
      forceLogout();
      throw error;
    }
  };

  // Enhanced fetch function with automatic token refresh
  const authenticatedFetch = async (url, options = {}) => {
    let token = localStorage.getItem('token');
    
    // Check if token is expired or will expire soon
    if (isTokenExpired(token)) {
      console.log('Token expired or expiring soon, attempting refresh...');
      try {
        token = await refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        forceLogout();
        throw new Error('Authentication required');
      }
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 errors
    if (response.status === 401) {
      console.log('Received 401, attempting token refresh...');
      try {
        const newToken = await refreshToken();
        // Retry the request with the new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
        
        if (retryResponse.status === 401) {
          // If still 401 after refresh, force logout
          forceLogout();
          throw new Error('Authentication required');
        }
        
        return retryResponse;
      } catch (error) {
        console.error('Token refresh failed after 401:', error);
        forceLogout();
        throw new Error('Authentication required');
      }
    }

    return response;
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('AuthContext: Checking localStorage', { token: !!token, userData: !!userData });
    
    if (token && userData) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('AuthContext: Token is expired, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setTokenExpiry(null);
      } else {
        const parsedUser = JSON.parse(userData);
        console.log('AuthContext: Setting user from localStorage', parsedUser);
        setUser(parsedUser);
        setTokenExpiry(getTokenExpiry(token));
      }
    } else {
      console.log('AuthContext: No user data found in localStorage');
    }
    setLoading(false);
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const provider = urlParams.get('provider');
    const error = urlParams.get('error');
    const message = urlParams.get('message');

    console.log('AuthContext: OAuth callback check', { 
      pathname: window.location.pathname,
      search: window.location.search,
      token: !!token, 
      provider,
      error,
      message 
    });

    if (token && provider) {
      console.log('AuthContext: OAuth callback received', { provider, token: !!token, tokenLength: token.length });
      
      // Store the token and redirect
      localStorage.setItem('token', token);
      
      // Decode token to get user info
      try {
        const decoded = jwtDecode(token);
        const userInfo = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name || 'User',
          profileImage: decoded.picture,
          oauthProvider: provider,
        };
        
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
        setTokenExpiry(getTokenExpiry(token));
        
        // Clear URL parameters and redirect to home
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = '/';
      } catch (error) {
        console.error('AuthContext: Error processing OAuth token:', error);
        window.location.href = '/login?error=oauth_failed';
      }
    } else if (error || message) {
      console.error('AuthContext: OAuth error:', { error, message });
      window.location.href = `/login?error=${error || 'oauth_failed'}&message=${encodeURIComponent(message || 'Authentication failed')}`;
    }
  }, []);

  const login = async (email, password) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('Login attempt to:', apiUrl);
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      console.log('Login response status:', response.status);
      let rawText = '';
      let data = null;
      try {
        rawText = await response.text();
        try {
          data = JSON.parse(rawText);
          console.log('Login response JSON:', data);
        } catch (e) {
          console.log('Login response not JSON, raw text:', rawText);
        }
      } catch (e) {
        console.log('Login response could not be read:', e);
      }
      if (!response.ok) {
        console.error('Login error:', data || rawText);
        throw new Error(`Login failed: ${response.status} ${data?.message || rawText}`);
      }
      if (!data) {
        throw new Error('Login failed: No data returned');
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setTokenExpiry(getTokenExpiry(data.access_token));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('Signup attempt to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      console.log('Signup response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Signup failed';
        
        try {
          const errorData = await response.json();
          console.error('Signup error:', errorData);
          
          // Handle specific error cases based on status code
          if (response.status === 409) {
            errorMessage = 'User already exists';
          } else if (response.status === 400) {
            errorMessage = errorData.message || 'Invalid request data';
          } else if (response.status === 401) {
            errorMessage = errorData.message || 'Authentication failed';
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If response is not JSON, try to get text
          const errorText = await response.text();
          console.error('Signup error (text):', errorText);
          
          // Handle text-based errors
          if (response.status === 409) {
            errorMessage = 'User already exists';
          } else if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(`${errorMessage}`);
      }

      const data = await response.json();
      console.log('Signup success:', data);
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setTokenExpiry(getTokenExpiry(data.access_token));
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTokenExpiry(null);
  };

  const forceLogout = () => {
    console.log('Force logging out user');
    localStorage.clear();
    setUser(null);
    setTokenExpiry(null);
    // Redirect to login page
    window.location.href = '/login';
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    forceLogout,
    loading,
    authenticatedFetch,
    isTokenExpired,
    refreshToken,
    tokenExpiry,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 