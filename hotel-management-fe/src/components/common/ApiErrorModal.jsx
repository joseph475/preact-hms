import { h } from 'preact';
import Modal from './Modal';

const ApiErrorModal = ({ isOpen, onClose, error, onRetry }) => {
  const getErrorTitle = (error) => {
    if (!error) return 'API Error';
    
    // Check for specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Connection Error';
    }
    
    if (error.status) {
      switch (error.status) {
        case 400:
          return 'Bad Request';
        case 401:
          return 'Authentication Required';
        case 403:
          return 'Access Denied';
        case 404:
          return 'Not Found';
        case 408:
          return 'Request Timeout';
        case 429:
          return 'Too Many Requests';
        case 500:
          return 'Server Error';
        case 502:
          return 'Bad Gateway';
        case 503:
          return 'Service Unavailable';
        case 504:
          return 'Gateway Timeout';
        default:
          return `Error ${error.status}`;
      }
    }
    
    return 'API Error';
  };

  const getErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred. Please try again.';
    
    // Network/Connection errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }
    
    // HTTP status specific messages
    if (error.status) {
      switch (error.status) {
        case 400:
          return error.message || 'The request was invalid. Please check your input and try again.';
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 408:
          return 'The request timed out. Please try again.';
        case 429:
          return 'Too many requests. Please wait a moment before trying again.';
        case 500:
          return 'An internal server error occurred. Please try again later.';
        case 502:
          return 'The server is temporarily unavailable. Please try again later.';
        case 503:
          return 'The service is temporarily unavailable. Please try again later.';
        case 504:
          return 'The server took too long to respond. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred. Please try again.';
      }
    }
    
    // Generic error message
    return error.message || 'An unexpected error occurred. Please try again.';
  };

  const getErrorIcon = (error) => {
    if (!error) return 'exclamation-triangle';
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'wifi-off';
    }
    
    if (error.status) {
      switch (error.status) {
        case 401:
          return 'lock';
        case 403:
          return 'shield-exclamation';
        case 404:
          return 'question-mark-circle';
        case 500:
        case 502:
        case 503:
        case 504:
          return 'server';
        default:
          return 'exclamation-triangle';
      }
    }
    
    return 'exclamation-triangle';
  };

  const renderIcon = (iconType) => {
    const iconClass = "w-12 h-12 mx-auto mb-4";
    
    switch (iconType) {
      case 'wifi-off':
        return (
          <svg className={`${iconClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364m12.728 0L5.636 5.636M8.11 8.11a4 4 0 015.78 0M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'lock':
        return (
          <svg className={`${iconClass} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'shield-exclamation':
        return (
          <svg className={`${iconClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
          </svg>
        );
      case 'question-mark-circle':
        return (
          <svg className={`${iconClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'server':
        return (
          <svg className={`${iconClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconClass} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
    }
  };

  const shouldShowRetry = (error) => {
    if (!error) return true;
    
    // Don't show retry for authentication errors
    if (error.status === 401) return false;
    
    // Don't show retry for permission errors
    if (error.status === 403) return false;
    
    // Show retry for all other errors
    return true;
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        className="btn-outline"
        type="button"
      >
        Close
      </button>
      {shouldShowRetry(error) && onRetry && (
        <button
          onClick={() => {
            onRetry();
            onClose();
          }}
          className="btn-primary"
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getErrorTitle(error)}
      footer={footer}
      size="small"
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        {renderIcon(getErrorIcon(error))}
        
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {getErrorMessage(error)}
          </p>
        </div>

        {/* Technical details for debugging (only in development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 font-mono">
              <div><strong>Error:</strong> {error.name || 'Unknown'}</div>
              <div><strong>Message:</strong> {error.message || 'No message'}</div>
              {error.status && <div><strong>Status:</strong> {error.status}</div>}
              {error.stack && (
                <div className="mt-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </Modal>
  );
};

export default ApiErrorModal;
