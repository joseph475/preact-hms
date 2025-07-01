import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Router from 'preact-router';
import { useAuth } from '../hooks/useAuth';
import { SearchProvider } from '../hooks/useSearch';
import { ApiErrorProvider, useApiError } from '../hooks/useApiError';
import apiService from '../services/api';

// Layout components
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';

// Common components
import ProtectedRoute from './common/ProtectedRoute';
import ApiErrorModal from './common/ApiErrorModal';

// Page components
import LoginPage from './pages/auth/LoginPage';
import RoomsPage from './pages/rooms/RoomsPage';
import GuestsPage from './pages/guests/GuestsPage';
import BookingsPage from './pages/bookings/BookingsPage';
import ReportsPage from './pages/reports/ReportsPage';
import UsersPage from './pages/users/UsersPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import ReceiptPage from './pages/receipt/ReceiptPage';

// Main App Content Component
const AppContent = () => {
  const { user, loading, isAuthenticated, login, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const apiError = useApiError();

  // Set up API error handler
  useEffect(() => {
    apiService.setErrorHandler(apiError);
  }, [apiError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // Handle receipt page separately (no authentication required for printing)
  if (window.location.pathname === '/receipt') {
    return <ReceiptPage />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          </div>
        )}

        {/* Sidebar */}
        <Sidebar 
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <Header 
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
            onLogout={logout}
          />

          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="py-8">
              <div className="max-w-none mx-auto px-6 sm:px-8 lg:px-10">
                <Router>
                  {/* Rooms as default landing page - accessible by both admin and user */}
                  <ProtectedRoute path="/" user={user} allowedRoles={['admin', 'user']}>
                    <RoomsPage user={user} />
                  </ProtectedRoute>
                  
                  <ProtectedRoute path="/rooms" user={user} allowedRoles={['admin', 'user']}>
                    <RoomsPage user={user} />
                  </ProtectedRoute>
                  
                  {/* Bookings - accessible by both admin and user */}
                  <ProtectedRoute path="/bookings" user={user} allowedRoles={['admin', 'user']}>
                    <BookingsPage user={user} />
                  </ProtectedRoute>
                  
                  {/* Reports - accessible by both admin and user */}
                  <ProtectedRoute path="/reports" user={user} allowedRoles={['admin', 'user']}>
                    <ReportsPage user={user} />
                  </ProtectedRoute>
                  
                  {/* Profile - accessible by both admin and user */}
                  <ProtectedRoute path="/profile" user={user} allowedRoles={['admin', 'user']}>
                    <ProfilePage user={user} />
                  </ProtectedRoute>
                  
                  {/* Guests - accessible by both admin and user */}
                  <ProtectedRoute path="/guests" user={user} allowedRoles={['admin', 'user']}>
                    <GuestsPage user={user} />
                  </ProtectedRoute>
                  
                  {/* Admin only routes */}
                  
                  <ProtectedRoute path="/users" user={user} allowedRoles={['admin']}>
                    <UsersPage user={user} />
                  </ProtectedRoute>
                  
                  <ProtectedRoute path="/settings" user={user} allowedRoles={['admin']}>
                    <SettingsPage user={user} />
                  </ProtectedRoute>
                </Router>
              </div>
            </div>
          </main>
        </div>

        {/* Global API Error Modal */}
        <ApiErrorModal
          isOpen={apiError.isModalOpen}
          onClose={apiError.hideError}
          error={apiError.error}
          onRetry={apiError.hasRetry ? apiError.retry : null}
        />
      </div>
    </SearchProvider>
  );
};

// Main App Component with Error Provider
const App = () => {
  return (
    <ApiErrorProvider>
      <AppContent />
    </ApiErrorProvider>
  );
};

export default App;
