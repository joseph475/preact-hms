import { useApiError } from '../hooks/useApiError';

// Helper hook for API calls with error handling and retry functionality
export const useApiCall = () => {
  const { showError } = useApiError();

  const callApi = async (apiFunction, options = {}) => {
    const {
      onSuccess,
      onError,
      showErrorModal = true,
      retryable = true,
      context = {}
    } = options;

    const executeCall = async () => {
      try {
        const result = await apiFunction();
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } catch (error) {
        if (onError) {
          onError(error);
        }

        // Show error modal if enabled
        if (showErrorModal) {
          const retryCallback = retryable ? executeCall : null;
          showError({ ...error, ...context }, retryCallback);
        }

        throw error;
      }
    };

    return executeCall();
  };

  return { callApi };
};

// Helper function to create API calls with built-in retry functionality
export const createRetryableApiCall = (apiFunction, context = {}) => {
  return async (errorHandler) => {
    const executeCall = async () => {
      try {
        return await apiFunction();
      } catch (error) {
        if (errorHandler) {
          errorHandler.showError({ ...error, ...context }, executeCall);
        }
        throw error;
      }
    };

    return executeCall();
  };
};

// Helper function to suppress error modals for specific API calls
export const suppressErrorModal = (apiFunction) => {
  return async (...args) => {
    try {
      return await apiFunction(...args);
    } catch (error) {
      // Add flag to suppress error modal
      error.suppressErrorModal = true;
      throw error;
    }
  };
};

// Helper function to add context to API errors
export const withErrorContext = (apiFunction, context) => {
  return async (...args) => {
    try {
      return await apiFunction(...args);
    } catch (error) {
      // Add context to error
      Object.assign(error, context);
      throw error;
    }
  };
};

// Helper function to create API calls with custom retry logic
export const withCustomRetry = (apiFunction, retryOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = (error) => error.status >= 500
  } = retryOptions;

  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiFunction(...args);
      } catch (error) {
        lastError = error;
        
        // Don't retry if this is the last attempt or if retry condition is not met
        if (attempt === maxRetries || !retryCondition(error)) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  };
};

// Helper function to batch API calls with error handling
export const batchApiCalls = async (apiCalls, options = {}) => {
  const {
    continueOnError = false,
    showErrorModal = true,
    errorHandler
  } = options;

  const results = [];
  const errors = [];

  for (let i = 0; i < apiCalls.length; i++) {
    try {
      const result = await apiCalls[i]();
      results.push({ index: i, success: true, data: result });
    } catch (error) {
      const errorInfo = { index: i, success: false, error };
      results.push(errorInfo);
      errors.push(errorInfo);

      if (showErrorModal && errorHandler) {
        errorHandler.showError(error);
      }

      if (!continueOnError) {
        break;
      }
    }
  }

  return {
    results,
    errors,
    hasErrors: errors.length > 0,
    allSuccessful: errors.length === 0
  };
};

export default {
  useApiCall,
  createRetryableApiCall,
  suppressErrorModal,
  withErrorContext,
  withCustomRetry,
  batchApiCalls
};
