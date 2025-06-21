import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import apiService from '../../../services/api';

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error">
        {error}
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
    <div className="stats-card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 bg-${color}-500 rounded-xl flex items-center justify-center shadow-lg`}>
              {icon}
            </div>
          </div>
          <div className="ml-6 w-0 flex-1">
            <dl>
              <dt className="text-sm font-semibold text-gray-600 truncate mb-1">{title}</dt>
              <dd className="text-2xl font-bold text-gray-900 mb-1">{value}</dd>
              {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {user?.name}! Here's what's happening at your hotel today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Rooms"
          value={stats?.rooms?.total || 0}
          subtitle={`${stats?.rooms?.available || 0} available`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="blue"
        />

        <StatCard
          title="Occupancy Rate"
          value={`${stats?.rooms?.occupancyRate || 0}%`}
          subtitle={`${stats?.rooms?.occupied || 0} occupied`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="green"
        />

        <StatCard
          title="Today's Bookings"
          value={stats?.bookings?.today || 0}
          subtitle={`${stats?.bookings?.checkInsToday || 0} check-ins`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="yellow"
        />

        <StatCard
          title="Monthly Revenue"
          value={`₱${(stats?.revenue?.monthly || 0).toLocaleString()}`}
          subtitle="This month"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Recent bookings and room status */}
      <div className="dashboard-section">
        {/* Recent Bookings */}
        <div className="card-elevated">
          <div className="card-header">
            <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="card-body">
            {stats?.recentBookings?.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.guest?.firstName} {booking.guest?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Room {booking.room?.roomNumber} • {booking.duration}h
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        booking.bookingStatus === 'Confirmed' ? 'badge-info' :
                        booking.bookingStatus === 'Checked In' ? 'badge-success' :
                        booking.bookingStatus === 'Checked Out' ? 'badge-secondary' :
                        'badge-warning'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="empty-state-title">No recent bookings</h3>
                <p className="empty-state-description">Bookings will appear here when guests make reservations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Room Occupancy by Type */}
        <div className="card-elevated">
          <div className="card-header">
            <h3 className="text-xl font-bold text-gray-900">Room Occupancy by Type</h3>
          </div>
          <div className="card-body">
            {stats?.roomOccupancy?.length > 0 ? (
              <div className="space-y-6">
                {stats.roomOccupancy.map((room, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{room._id}</span>
                      <span className="text-sm text-gray-600 font-medium">
                        {room.occupied}/{room.total} occupied
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${room.total > 0 ? (room.occupied / room.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {room.total > 0 ? Math.round((room.occupied / room.total) * 100) : 0}% occupied
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="empty-state-title">No room data available</h3>
                <p className="empty-state-description">Room occupancy data will appear here once rooms are configured.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-elevated">
        <div className="card-header">
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600 mt-1">Frequently used actions for hotel management</p>
        </div>
        <div className="card-body">
          <div className="quick-actions-grid">
            <a href="/bookings" className="quick-action-item">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">New Booking</span>
              <span className="text-xs text-gray-500 mt-1">Create reservation</span>
            </a>

            <a href="/guests" className="quick-action-item">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">View Guests</span>
              <span className="text-xs text-gray-500 mt-1">Guest registry</span>
            </a>

            <a href="/rooms" className="quick-action-item">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">Manage Rooms</span>
              <span className="text-xs text-gray-500 mt-1">Room status</span>
            </a>

            <a href="/reports" className="quick-action-item">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">View Reports</span>
              <span className="text-xs text-gray-500 mt-1">Analytics</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
