import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useSimpleCache } from '../../../hooks/useSimpleCache';
import apiService from '../../../services/api';
import cacheService from '../../../services/cacheService';
import DashboardSkeleton from '../../common/skeletons/DashboardSkeleton';
import Modal from '../../common/Modal';
import CheckOutModal from '../bookings/components/CheckOutModal';
import FoodOrderModal from '../../common/FoodOrderModal';

const DashboardPage = ({ user }) => {
  const {
    data: statsResponse,
    loading,
    error,
    refresh: loadDashboardStats
  } = useSimpleCache(
    '/dashboard/stats',
    () => apiService.getDashboardStats(),
    {
      refreshInterval: 2 * 60 * 1000
    }
  );

  const { data: roomsResponse, loading: roomsLoading, refresh: refreshRooms } = useSimpleCache(
    '/rooms',
    () => apiService.getRooms(),
    {
      refreshInterval: 2 * 60 * 1000
    }
  );

  const {
    data: todayResponse,
    refresh: refreshToday
  } = useSimpleCache(
    '/dashboard/today',
    () => apiService.getDashboardToday(),
    { refreshInterval: 60 * 1000 }
  );

  const stats = statsResponse?.data;
  const rooms = roomsResponse?.data || [];
  const todayData = todayResponse?.data || { arriving: [], departing: [] };

  // Occupied room popup state
  const [roomPopup, setRoomPopup] = useState({ open: false, room: null, booking: null, loading: false });
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [showFoodOrder, setShowFoodOrder] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  const handleQuickAction = async (action, bookingId) => {
    try {
      if (action === 'checkin') {
        await apiService.checkInGuest(bookingId);
      } else {
        await apiService.checkOutGuest(bookingId);
      }
      refreshToday();
    } catch (err) {
      // error modal shown by apiService errorHandler
    }
  };

  const handleOccupiedRoomClick = async (room) => {
    if (room.status !== 'Occupied') return;
    setRoomPopup({ open: true, room, booking: null, loading: true });
    try {
      const res = await apiService.request(`/bookings?room=${room._id}&bookingStatus=Checked%20In`);
      const booking = res.data?.[0] || null;
      setRoomPopup(prev => ({ ...prev, booking, loading: false }));
    } catch {
      setRoomPopup(prev => ({ ...prev, loading: false }));
    }
  };

  const closeRoomPopup = () => {
    setRoomPopup({ open: false, room: null, booking: null, loading: false });
    setShowCheckOut(false);
    setShowFoodOrder(false);
  };

  const handleCheckOutConfirm = async (paymentDetails) => {
    if (!roomPopup.booking) return;
    setCheckOutLoading(true);
    try {
      const booking = roomPopup.booking;
      const foodTotal = (booking.foodOrders || []).reduce((s, o) => s + (o.total || 0), 0);
      const extTotal = (booking.extensionCharges || []).reduce((s, c) => s + (c.charge || 0), 0);

      const payments = paymentDetails.payments || [];
      const paidAmount = paymentDetails.paidAmount ?? ((booking.totalAmount || 0) + foodTotal + extTotal);
      const primaryMethod = payments.length > 0 ? payments[0].method : (booking.paymentMethod || 'Cash');
      const primaryReference = payments.find(p => p.method === 'Bank Transfer')?.reference || '';

      const res = await apiService.checkOutGuest(booking._id);
      if (res.success) {
        await apiService.updateBooking(booking._id, {
          paymentStatus: 'Paid',
          paidAmount,
          paymentMethod: primaryMethod,
          bankReference: primaryReference,
          splitPayments: payments.length > 1 ? payments : [],
        });
        cacheService.invalidate('rooms');
        await Promise.all([refreshRooms(), loadDashboardStats()]);
        closeRoomPopup();
      }
    } catch {
      // error handled by apiService
    } finally {
      setCheckOutLoading(false);
    }
  };

  const handleAddFoodOrder = async (bookingId, orderData) => {
    const res = await apiService.addFoodOrder(bookingId, orderData);
    if (res.success) {
      const updated = await apiService.request(`/bookings?room=${roomPopup.room._id}&bookingStatus=Checked%20In`);
      const booking = updated.data?.[0] || roomPopup.booking;
      setRoomPopup(prev => ({ ...prev, booking }));
    }
    return res;
  };

  const handleRemoveFoodOrder = async (bookingId, orderId) => {
    const res = await apiService.removeFoodOrder(bookingId, orderId);
    if (res.success) {
      const updated = await apiService.request(`/bookings?room=${roomPopup.room._id}&bookingStatus=Checked%20In`);
      const booking = updated.data?.[0] || roomPopup.booking;
      setRoomPopup(prev => ({ ...prev, booking }));
    }
    return res;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="alert-error">
        {error?.message || 'Failed to load dashboard data. Make sure the backend is running.'}
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, iconBg = 'bg-amber-500' }) => (
    <div className="stats-card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
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
          iconBg="bg-amber-500"
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
          iconBg="bg-green-500"
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
          iconBg="bg-yellow-500"
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
          iconBg="bg-purple-500"
        />

        <StatCard
          title="ADR"
          value={`₱${(stats?.revenue?.adr || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          subtitle="Avg daily rate"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          iconBg="bg-teal-500"
        />

        <StatCard
          title="RevPAR"
          value={`₱${(stats?.revenue?.revpar || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          subtitle="Rev per available room"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          iconBg="bg-indigo-500"
        />
      </div>

      {/* Today's Arrivals & Departures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Arriving Today */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
            </svg>
            <h3 className="text-sm font-semibold text-primary-900">Arriving Today</h3>
            <span className="ml-auto text-xs text-gray-400">{todayData.arriving.length}</span>
          </div>
          {todayData.arriving.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">None today</p>
          ) : (
            <table className="w-full">
              <tbody>
                {todayData.arriving.map(b => (
                  <tr key={b._id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 text-sm">{b.guest.firstName} {b.guest.lastName}</div>
                      <div className="text-xs text-gray-500">Room {b.room?.roomNumber}</div>
                    </td>
                    <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                      {new Date(b.checkInDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => handleQuickAction('checkin', b._id)}
                        className="action-btn action-btn-success text-xs"
                      >
                        Check In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Departing Today */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <h3 className="text-sm font-semibold text-primary-900">Departing Today</h3>
            <span className="ml-auto text-xs text-gray-400">{todayData.departing.length}</span>
          </div>
          {todayData.departing.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">None today</p>
          ) : (
            <table className="w-full">
              <tbody>
                {todayData.departing.map(b => (
                  <tr key={b._id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900 text-sm">{b.guest.firstName} {b.guest.lastName}</div>
                      <div className="text-xs text-gray-500">Room {b.room?.roomNumber}</div>
                    </td>
                    <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                      {new Date(b.checkOutDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="table-cell text-right">
                      <button
                        onClick={() => handleQuickAction('checkout', b._id)}
                        className="action-btn action-btn-warning text-xs"
                      >
                        Check Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Room Status Grid */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-900">Room Status</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-600"></span> Occupied (click to manage)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-200"></span> Available</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></span> Needs Cleaning</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-200 border-dashed"></span> Maint / OOO</span>
          </div>
        </div>
        {roomsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {rooms.map(room => {
                const status = room.status;
                const typeLabel = room.roomType?.name
                  ? room.roomType.name.slice(0, 3).toUpperCase()
                  : '---';
                const isOccupied = status === 'Occupied';
                let chipClass = '';
                if (isOccupied) {
                  chipClass = 'bg-amber-600 text-white border-amber-600 cursor-pointer hover:bg-amber-700 hover:ring-2 hover:ring-amber-400 hover:ring-offset-1 transition-all';
                } else if (status === 'Available') {
                  chipClass = 'bg-amber-100 text-amber-800 border-amber-200 cursor-default select-none';
                } else if (status === 'Needs Cleaning') {
                  chipClass = 'bg-blue-100 text-blue-800 border-blue-200 cursor-default select-none';
                } else {
                  chipClass = 'bg-red-100 text-red-800 border-red-200 border-dashed cursor-default select-none';
                }
                return (
                  <div
                    key={room._id}
                    className={`border rounded-lg p-2 text-center ${chipClass}`}
                    title={isOccupied ? `Room ${room.roomNumber} — Click to manage` : `Room ${room.roomNumber} — ${room.roomType?.name || 'Unknown'} — ${status}`}
                    onClick={() => isOccupied && handleOccupiedRoomClick(room)}
                  >
                    <div className="text-sm font-bold leading-tight">{room.roomNumber}</div>
                    <div className="text-[10px] leading-tight opacity-80">{typeLabel}</div>
                  </div>
                );
              })}
            </div>
            {rooms.length === 0 && (
              <p className="text-sm text-primary-800 opacity-60 text-center py-4">No rooms found.</p>
            )}
          </div>
        )}
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
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-300"
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
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Occupied Room Info Popup */}
      <Modal
        isOpen={roomPopup.open && !showCheckOut && !showFoodOrder}
        onClose={closeRoomPopup}
        title={`Room ${roomPopup.room?.roomNumber}`}
        size="small"
      >
        {roomPopup.loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : roomPopup.booking ? (
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="font-bold text-gray-900 text-base">
                {roomPopup.booking.guest?.firstName} {roomPopup.booking.guest?.lastName}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {roomPopup.room?.roomType?.name || 'Room'} · {roomPopup.booking.duration}h
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Checked in: {new Date(roomPopup.booking.actualCheckIn || roomPopup.booking.checkInDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-400">
                Check-out: {new Date(roomPopup.booking.checkOutDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFoodOrder(true)}
                className="flex-1 action-btn bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 justify-center py-2.5"
              >
                Add Food Order
              </button>
              <button
                onClick={() => setShowCheckOut(true)}
                className="flex-1 action-btn bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 justify-center py-2.5"
              >
                Check Out
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No active booking found for this room.</p>
            <button onClick={closeRoomPopup} className="mt-3 btn-outline text-sm">Close</button>
          </div>
        )}
      </Modal>

      {/* Check Out Modal (from room popup) */}
      <CheckOutModal
        isOpen={showCheckOut}
        booking={roomPopup.booking}
        onClose={() => setShowCheckOut(false)}
        onConfirm={handleCheckOutConfirm}
        isLoading={checkOutLoading}
      />

      {/* Food Order Modal (from room popup) */}
      <FoodOrderModal
        isOpen={showFoodOrder}
        onClose={() => setShowFoodOrder(false)}
        booking={roomPopup.booking}
        onAddFoodOrder={handleAddFoodOrder}
        onRemoveFoodOrder={handleRemoveFoodOrder}
      />
    </div>
  );
};

export default DashboardPage;
