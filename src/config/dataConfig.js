/**
 * SMARTWISH DATA CONFIGURATION
 * 
 * Configuration for data sources and providers
 * Easy to switch between local data and future database
 * 
 * @version 1.0.0
 * @author SmartWish Team
 */

export const DATA_CONFIG = {
  // Data source configuration
  USE_LOCAL_DATA: true, // Set to false when Supabase is integrated
  
  // API configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Cache configuration
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  
  // Feature flags
  ENABLE_CACHING: true,
  ENABLE_FALLBACK: true,
  
  // Database configuration (for future use)
  DATABASE: {
    TYPE: 'local', // 'local', 'supabase', 'postgres', etc.
    CONNECTION_STRING: null,
    TABLES: {
      CATEGORIES: 'categories',
      TEMPLATES: 'templates',
      USERS: 'users',
      SAVED_DESIGNS: 'saved_designs'
    }
  }
};

/**
 * Get data provider configuration
 * @returns {Object} Data provider config
 */
export const getDataProviderConfig = () => {
  return {
    useLocalData: DATA_CONFIG.USE_LOCAL_DATA,
    apiBaseUrl: DATA_CONFIG.API_BASE_URL,
    cacheTimeout: DATA_CONFIG.CACHE_TIMEOUT,
    enableCaching: DATA_CONFIG.ENABLE_CACHING,
    enableFallback: DATA_CONFIG.ENABLE_FALLBACK
  };
};

/**
 * Check if local data mode is enabled
 * @returns {boolean} Whether local data mode is enabled
 */
export const isLocalDataMode = () => {
  return DATA_CONFIG.USE_LOCAL_DATA;
};

/**
 * Check if database mode is enabled
 * @returns {boolean} Whether database mode is enabled
 */
export const isDatabaseMode = () => {
  return !DATA_CONFIG.USE_LOCAL_DATA;
};

/**
 * Update data configuration
 * @param {Object} config - New configuration
 */
export const updateDataConfig = (config) => {
  Object.assign(DATA_CONFIG, config);
};

export default DATA_CONFIG; 