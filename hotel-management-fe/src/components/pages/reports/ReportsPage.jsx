import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import apiService from '../../../services/api';
import { useSearch } from '../../../hooks/useSearch';
import Pagination from '../../common/Pagination';

const ReportsPage = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [bookingReports, setBookingReports] = useState([]);
  const [revenueReports, setRevenueReports] = useState([]);
  const [occupancyReports, setOccupancyReports] = useState([]);
  const [guestReports, setGuestReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { updateCurrentPage } = useSearch();

  const tabs = [
    { id: 'bookings', name: 'Booking Reports', icon: 'calendar' },
    { id: 'revenue', name: 'Revenue Reports', icon: 'currency' },
    { id: 'occupancy', name: 'Occupancy Reports', icon: 'chart' },
    { id: 'guests', name: 'Guest Reports', icon: 'users' }
  ];

  useEffect(() => {
    updateCurrentPage('/reports');
    loadReports();
  }, []);

  useEffect(() => {
    loadReports();
  }, [activeTab, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Use regular bookings endpoint for all reports since dedicated reports endpoints may not exist
      const bookingsRes = await apiService.getBookings();
      
      if (bookingsRes.success && Array.isArray(bookingsRes.data)) {
        const allBookings = bookingsRes.data;
        
        // Filter bookings by date range
        const filteredBookings = allBookings.filter(booking => {
          const bookingDate = new Date(booking.checkInDate);
          const startDate = new Date(dateRange.startDate);
          const endDate = new Date(dateRange.endDate);
          return bookingDate >= startDate && bookingDate <= endDate;
        });
        
        // Set data for all tabs
        setBookingReports(filteredBookings);
        setRevenueReports(filteredBookings);
        setOccupancyReports(filteredBookings);
        setGuestReports(filteredBookings);
      } else {
        // Initialize empty arrays if no data
        setBookingReports([]);
        setRevenueReports([]);
        setOccupancyReports([]);
        setGuestReports([]);
      }
    } catch (err) {
      setError('Failed to load reports data');
      console.error('Load reports error:', err);
      // Ensure all arrays are initialized even on error
      setBookingReports([]);
      setRevenueReports([]);
      setOccupancyReports([]);
      setGuestReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getIconSvg = (iconType) => {
    const icons = {
      calendar: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      ),
      currency: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      ),
      chart: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
      users: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      )
    };
    return icons[iconType] || icons.calendar;
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'bookings': return bookingReports;
      case 'revenue': return revenueReports;
      case 'occupancy': return occupancyReports;
      case 'guests': return guestReports;
      default: return [];
    }
  };

  const getPaginatedData = () => {
    const data = getCurrentData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const formatCurrency = (amount) => {
    return `₱${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const renderBookingReports = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                <dd className="text-lg font-medium text-gray-900">{bookingReports.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {bookingReports.filter(b => b.bookingStatus === 'Checked Out').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {bookingReports.filter(b => ['Confirmed', 'Checked In'].includes(b.bookingStatus)).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Cancelled/No Show</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {bookingReports.filter(b => ['Cancelled', 'No Show'].includes(b.bookingStatus)).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Booking Details</th>
              <th className="table-header-cell">Guest</th>
              <th className="table-header-cell">Room</th>
              <th className="table-header-cell">Duration</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Date</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {getPaginatedData().map((booking) => (
              <tr key={booking._id} className="table-row">
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{booking.bookingNumber}</div>
                </td>
                <td className="table-cell">
                  <div className="font-medium text-gray-900">
                    {booking.guest?.firstName} {booking.guest?.lastName}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="font-medium text-gray-900">
                    Room {booking.room?.roomNumber}
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">{booking.duration}h</span>
                </td>
                <td className="table-cell">
                  <span className="font-medium text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    booking.bookingStatus === 'Checked Out' ? 'badge-success' :
                    booking.bookingStatus === 'Checked In' ? 'badge-info' :
                    booking.bookingStatus === 'Confirmed' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {booking.bookingStatus}
                  </span>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">
                    {formatDate(booking.checkInDate)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRevenueReports = () => (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(revenueReports.reduce((sum, r) => sum + (r.totalAmount || 0), 0))}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Average Booking</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(revenueReports.length > 0 ? 
                    revenueReports.reduce((sum, r) => sum + (r.totalAmount || 0), 0) / revenueReports.length : 0
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Paid Revenue</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(revenueReports.filter(r => r.paymentStatus === 'Paid').reduce((sum, r) => sum + (r.totalAmount || 0), 0))}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Duration */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Duration</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[3, 8, 12, 24].map(duration => {
            const durationRevenue = revenueReports.filter(r => r.duration === duration);
            const totalAmount = durationRevenue.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
            return (
              <div key={duration} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
                <div className="text-sm text-gray-600">{duration}h Bookings</div>
                <div className="text-xs text-gray-500">{durationRevenue.length} bookings</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderOccupancyReports = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Occupancy Overview</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Occupancy Analytics</h3>
          <p className="mt-1 text-sm text-gray-500">
            Detailed occupancy reports and room utilization analytics will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );

  const renderGuestReports = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Analytics</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Guest Reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            Guest analytics, repeat customer tracking, and demographic reports will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings': return renderBookingReports();
      case 'revenue': return renderRevenueReports();
      case 'occupancy': return renderOccupancyReports();
      case 'guests': return renderGuestReports();
      default: return renderBookingReports();
    }
  };

  if (loading && getCurrentData().length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">
              Comprehensive reports and analytics for hotel operations.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {getIconSvg(tab.icon)}
                </svg>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Pagination for tables */}
      {(['bookings', 'revenue'].includes(activeTab) && getCurrentData().length > itemsPerPage) && (
        <Pagination
          currentPage={currentPage}
          totalItems={getCurrentData().length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ReportsPage;
