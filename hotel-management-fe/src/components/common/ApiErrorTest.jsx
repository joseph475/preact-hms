import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useApiError } from '../../hooks/useApiError';
import { useApiCall } from '../../utils/apiHelpers';
import apiService from '../../services/api';

// Test component to demonstrate API error modal functionality
const ApiErrorTest = () => {
  const [loading, setLoading] = useState(false);
  const { showError } = useApiError();
  const { callApi } = useApiCall();

  // Simulate different types of API errors
  const simulateError = async (errorType) => {
    setLoading(true);
    
    try {
      switch (errorType) {
        case 'network':
          // Simulate network error by calling invalid URL
          await fetch('http://invalid-url-that-does-not-exist.com/api');
          break;
          
        case '404':
          // Simulate 404 error
          await apiService.request('/non-existent-endpoint');
          break;
          
        case '500':
          // Simulate server error by calling an endpoint that might return 500
          await apiService.request('/simulate-error');
          break;
          
        case '401':
          // Simulate unauthorized error
          const originalToken = apiService.token;
          apiService.setToken('invalid-token');
          try {
            await apiService.getCurrentUser();
          } finally {
            apiService.setToken(originalToken);
          }
          break;
          
        case 'timeout':
          // Simulate timeout error
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 100);
          await fetch('http://httpbin.org/delay/5', { 
            signal: controller.signal 
          });
          break;
          
        case 'custom':
          // Show custom error using the error handler directly
          showError({
            name: 'CustomError',
            message: 'This is a custom error message for testing purposes.',
            status: 418,
            context: 'test-component'
          }, () => {
            console.log('Retry callback executed!');
            alert('Retry was clicked!');
          });
          break;
          
        default:
          throw new Error('Unknown error type');
      }
    } catch (error) {
      console.log('Error caught:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test API call with retry functionality
  const testApiCallWithRetry = async () => {
    setLoading(true);
    
    await callApi(
      () => apiService.request('/non-existent-endpoint'),
      {
        context: { source: 'test-component', action: 'retry-test' },
        onSuccess: (result) => {
          console.log('API call succeeded:', result);
        },
        onError: (error) => {
          console.log('API call failed:', error);
        }
      }
    );
    
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">API Error Modal Test</h3>
        <p className="text-sm text-gray-600 mt-1">
          Use these buttons to test different types of API errors and the error modal functionality.
        </p>
      </div>
      
      <div className="card-body">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => simulateError('network')}
            disabled={loading}
            className="btn-danger text-sm"
          >
            Network Error
          </button>
          
          <button
            onClick={() => simulateError('404')}
            disabled={loading}
            className="btn-warning text-sm"
          >
            404 Not Found
          </button>
          
          <button
            onClick={() => simulateError('500')}
            disabled={loading}
            className="btn-danger text-sm"
          >
            Server Error
          </button>
          
          <button
            onClick={() => simulateError('401')}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            Unauthorized
          </button>
          
          <button
            onClick={() => simulateError('timeout')}
            disabled={loading}
            className="btn-warning text-sm"
          >
            Timeout Error
          </button>
          
          <button
            onClick={() => simulateError('custom')}
            disabled={loading}
            className="btn-primary text-sm"
          >
            Custom Error
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={testApiCallWithRetry}
            disabled={loading}
            className="btn-success text-sm"
          >
            Test API Call with Retry
          </button>
          <p className="text-xs text-gray-500 mt-2">
            This button demonstrates using the useApiCall hook with retry functionality.
          </p>
        </div>
        
        {loading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="spinner mr-2"></div>
            <span className="text-sm text-gray-600">Testing API error...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiErrorTest;
