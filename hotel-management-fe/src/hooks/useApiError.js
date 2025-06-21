import { h, createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';

// Create the API Error Context
const ApiErrorContext = createContext();

// API Error Provider Component
export const ApiErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCallback, setRetryCallback] = useState(null);

  const showError = (errorObj, onRetry = null) => {
    // Enhanced error object with additional properties
    const enhancedError = {
      ...errorObj,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };

    setError(enhancedError);
    setRetryCallback(() => onRetry);
    setIsModalOpen(true);

    // Log error for debugging
    console.error('API Error:', enhancedError);
  };

  const hideError = () => {
    setError(null);
    setRetryCallback(null);
    setIsModalOpen(false);
  };

  const retry = () => {
    if (retryCallback) {
      retryCallback();
    }
    hideError();
  };

  const value = {
    error,
    isModalOpen,
    showError,
    hideError,
    retry,
    hasRetry: !!retryCallback
  };

  return (
    <ApiErrorContext.Provider value={value}>
      {children}
    </ApiErrorContext.Provider>
  );
};

// Custom hook to use the API Error Context
export const useApiError = () => {
  const context = useContext(ApiErrorContext);
  
  if (!context) {
    throw new Error('useApiError must be used within an ApiErrorProvider');
  }
  
  return context;
};

// Helper function to create enhanced error objects
export const createApiError = (error, context = {}) => {
  // Handle different types of errors
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    };
  }

  // Handle HTTP response errors
  if (error && typeof error === 'object') {
    return {
      name: 'ApiError',
      message: error.message || 'An API error occurred',
      status: error.status,
      statusText: error.statusText,
      ...context
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      name: 'ApiError',
      message: error,
      ...context
    };
  }

  // Fallback for unknown error types
  return {
    name: 'UnknownError',
    message: 'An unknown error occurred',
    originalError: error,
    ...context
  };
};

// Helper function to determine if an error should be shown in the modal
export const shouldShowErrorModal = (error) => {
  // Don't show modal for certain error types
  if (!error) return false;
  
  // Don't show for validation errors (usually handled by forms)
  if (error.status === 422) return false;
  
  // Don't show for certain client errors that are handled elsewhere
  if (error.status === 400 && error.context === 'validation') return false;
  
  // Show modal for all other errors
  return true;
};

export default useApiError;
