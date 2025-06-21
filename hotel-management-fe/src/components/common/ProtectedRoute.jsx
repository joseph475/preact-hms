import { h } from 'preact';

const ProtectedRoute = ({ user, allowedRoles, children, fallback }) => {
  // Check if user has required role
  const hasAccess = allowedRoles.includes(user?.role);

  if (!hasAccess) {
    // If fallback component is provided, render it
    if (fallback) {
      return fallback;
    }

    // Default unauthorized page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-600">
              You don't have permission to access this page.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Required role: {allowedRoles.join(' or ')}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Your role: {user?.role || 'None'}
            </p>
            <div className="mt-6">
              <a
                href="/dashboard"
                className="btn-primary"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
