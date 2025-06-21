# API Error Modal System

This directory contains a comprehensive API error handling system that automatically displays user-friendly error modals whenever API issues occur throughout the application.

## Components

### ApiErrorModal.jsx
A sophisticated modal component that displays API errors with:
- **Context-aware error messages** based on error type and HTTP status codes
- **Appropriate icons** for different error types (network, server, authentication, etc.)
- **Retry functionality** for recoverable errors
- **Technical details** in development mode for debugging
- **Responsive design** that works on all screen sizes

### ApiErrorTest.jsx
A test component for demonstrating and testing the error modal functionality with various error scenarios.

## Hooks

### useApiError.js
A React context and hook system that provides:
- **Global error state management**
- **Error modal visibility control**
- **Retry callback handling**
- **Error context enhancement**

## Utilities

### apiHelpers.js
Helper functions for working with API calls and error handling:
- **useApiCall hook** - Simplified API calls with built-in error handling
- **createRetryableApiCall** - Create API calls with automatic retry functionality
- **suppressErrorModal** - Disable error modals for specific calls
- **withErrorContext** - Add context information to errors
- **withCustomRetry** - Custom retry logic with exponential backoff
- **batchApiCalls** - Handle multiple API calls with error aggregation

## Usage

### Basic Setup

The API error system is automatically set up in the main App component. No additional setup is required.

### Automatic Error Handling

All API calls made through the `apiService` will automatically show error modals when they fail:

```javascript
import apiService from '../services/api';

// This will automatically show an error modal if it fails
const rooms = await apiService.getRooms();
```

### Manual Error Handling

You can manually trigger error modals using the `useApiError` hook:

```javascript
import { useApiError } from '../hooks/useApiError';

const MyComponent = () => {
  const { showError } = useApiError();

  const handleCustomError = () => {
    showError({
      name: 'CustomError',
      message: 'Something went wrong with your custom operation.',
      status: 400
    }, () => {
      // Retry callback
      console.log('User clicked retry');
    });
  };

  return (
    <button onClick={handleCustomError}>
      Trigger Custom Error
    </button>
  );
};
```

### Using API Helpers

For more control over API calls and error handling:

```javascript
import { useApiCall } from '../utils/apiHelpers';
import apiService from '../services/api';

const MyComponent = () => {
  const { callApi } = useApiCall();

  const loadData = async () => {
    await callApi(
      () => apiService.getRooms(),
      {
        context: { source: 'rooms-page', action: 'load-rooms' },
        onSuccess: (data) => {
          console.log('Rooms loaded:', data);
        },
        onError: (error) => {
          console.log('Failed to load rooms:', error);
        }
      }
    );
  };

  return (
    <button onClick={loadData}>
      Load Rooms
    </button>
  );
};
```

### Suppressing Error Modals

Sometimes you may want to handle errors manually without showing the modal:

```javascript
import apiService from '../services/api';

// Option 1: Use suppressErrorModal flag in request options
try {
  const data = await apiService.request('/endpoint', {
    suppressErrorModal: true
  });
} catch (error) {
  // Handle error manually
  console.log('Handle this error manually:', error);
}

// Option 2: Use the suppressErrorModal helper
import { suppressErrorModal } from '../utils/apiHelpers';

try {
  const data = await suppressErrorModal(apiService.getRooms)();
} catch (error) {
  // Handle error manually
}
```

### Adding Context to Errors

You can add additional context to errors for better debugging and user experience:

```javascript
import { withErrorContext } from '../utils/apiHelpers';

const loadRoomsWithContext = withErrorContext(
  apiService.getRooms,
  { 
    source: 'dashboard',
    userAction: 'refresh-rooms',
    timestamp: new Date().toISOString()
  }
);

// This error will include the context information
await loadRoomsWithContext();
```

## Error Types and Handling

The system handles various types of errors:

### Network Errors
- **Connection failures** - Shows "Connection Error" with network troubleshooting advice
- **Timeout errors** - Shows "Request Timeout" with retry option
- **DNS resolution failures** - Shows connection error with network check advice

### HTTP Status Errors
- **400 Bad Request** - Shows validation or request format errors
- **401 Unauthorized** - Shows authentication required message (no retry)
- **403 Forbidden** - Shows access denied message (no retry)
- **404 Not Found** - Shows resource not found message
- **408 Request Timeout** - Shows timeout message with retry
- **429 Too Many Requests** - Shows rate limiting message
- **500+ Server Errors** - Shows server error messages with retry

### Custom Errors
- **Application-specific errors** - Custom error messages and handling
- **Validation errors** - Form validation and business logic errors

## Configuration

### Error Modal Behavior

You can customize error modal behavior by modifying the `shouldShowErrorModal` function in `useApiError.js`:

```javascript
export const shouldShowErrorModal = (error) => {
  // Don't show modal for validation errors
  if (error.status === 422) return false;
  
  // Don't show for certain client errors handled elsewhere
  if (error.status === 400 && error.context === 'validation') return false;
  
  // Add your custom logic here
  
  return true;
};
```

### Retry Logic

Customize retry behavior by modifying the retry conditions in the modal component or using custom retry helpers:

```javascript
import { withCustomRetry } from '../utils/apiHelpers';

const apiCallWithCustomRetry = withCustomRetry(
  apiService.getRooms,
  {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error) => error.status >= 500
  }
);
```

## Development and Testing

### Testing Error Scenarios

Use the `ApiErrorTest` component to test different error scenarios:

```javascript
import ApiErrorTest from '../components/common/ApiErrorTest';

// Add this component to any page for testing
<ApiErrorTest />
```

### Development Mode Features

In development mode, the error modal shows additional technical details:
- **Error name and type**
- **Full error message**
- **HTTP status code**
- **Stack trace** (when available)
- **Request details** (endpoint, method)

### Debugging

All errors are automatically logged to the console with full details. Check the browser console for:
- **API Error logs** - Full error objects with context
- **Retry attempts** - When retry callbacks are executed
- **Error modal state** - When modals are shown/hidden

## Best Practices

1. **Let the system handle most errors automatically** - Don't manually handle every API error
2. **Add context to important operations** - Use error context for better debugging
3. **Suppress modals only when necessary** - Only suppress when you have custom error handling
4. **Use retry functionality wisely** - Don't enable retry for operations that shouldn't be retried
5. **Test error scenarios** - Use the test component to verify error handling works correctly
6. **Monitor error logs** - Check console logs for patterns in API errors

## Customization

### Styling

The error modal uses the existing CSS classes from the application. Modify `src/styles/index.css` to customize:
- **Modal appearance** - `.modal-overlay`, `.modal-container`
- **Button styles** - `.btn-primary`, `.btn-outline`
- **Icon colors** - Modify the `text-red-500`, `text-yellow-500` classes in the modal component

### Error Messages

Customize error messages by modifying the `getErrorMessage` function in `ApiErrorModal.jsx`:

```javascript
const getErrorMessage = (error) => {
  // Add your custom error message logic here
  if (error.code === 'CUSTOM_ERROR') {
    return 'Your custom error message here';
  }
  
  // ... existing logic
};
```

### Icons

Add new error icons by modifying the `renderIcon` function in `ApiErrorModal.jsx` and adding new cases to `getErrorIcon`.

This system provides a robust, user-friendly way to handle API errors throughout your application while maintaining flexibility for custom error handling when needed.
