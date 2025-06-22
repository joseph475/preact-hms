// Environment configuration for API endpoints
export const getEnvironmentConfig = () => {
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
  
  return {
    isDevelopment,
    isProduction: !isDevelopment,
    apiBaseUrl: getApiBaseUrl(),
    environment: isDevelopment ? 'development' : 'production'
  };
};

const getApiBaseUrl = () => {
  // Development environment (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8001/api/v1';
  }
  
  // Check for environment variable (useful for different deployment environments)
  // Use try-catch to handle cases where process.env might not be available
  try {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
  } catch (error) {
    console.warn('Environment variables not available:', error);
  }
  
  // Production fallback - replace this with your actual backend URL after deployment
  return 'https://preact-hms-be.vercel.app/api/v1';
};

export default getEnvironmentConfig;
