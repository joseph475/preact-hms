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
  const [bookingReports, setBookingReports] = useState({ bookings: [], summary: {} });
  const [revenueReports, setRevenueReports] = useState({});
  const [occupancyReports, setOccupancyReports] = useState({});
  const [guestReports, setGuestReports] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { updateCurrentPage } = useSearch();

  const tabs = [
    { id: 'bookings', name: 'Booking Reports', icon: 'calendar' }
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
      setError('');
      
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      console.log('Loading reports for tab:', activeTab, 'with params:', params);
      
      // Load data based on active tab
      switch (activeTab) {
        case 'bookings':
          console.log('Fetching booking reports...');
          const bookingRes = await apiService.getBookingReports(params);
          console.log('Booking reports response:', bookingRes);
          if (bookingRes.success) {
            setBookingReports(bookingRes.data || { bookings: [], summary: {} });
          }
          break;
          
        case 'revenue':
          console.log('Fetching revenue reports...');
          const revenueRes = await apiService.getRevenueReports(params);
          console.log('Revenue reports response:', revenueRes);
          if (revenueRes.success) {
            setRevenueReports(revenueRes.data || {});
          }
          break;
          
        case 'occupancy':
          console.log('Fetching occupancy reports...');
          const occupancyRes = await apiService.getOccupancyReports(params);
          console.log('Occupancy reports response:', occupancyRes);
          if (occupancyRes.success) {
            setOccupancyReports(occupancyRes.data || {});
          }
          break;
          
        case 'guests':
          console.log('Fetching guest reports...');
          const guestRes = await apiService.getGuestReports(params);
          console.log('Guest reports response:', guestRes);
          if (guestRes.success) {
            setGuestReports(guestRes.data || {});
          }
          break;
          
        default:
          break;
      }
    } catch (err) {
      setError('Failed to load reports data: ' + err.message);
      console.error('Load reports error:', err);
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

  const handlePrint = () => {
    const printContent = document.getElementById('report-content');
    
    // Create print styles
    const printStyles = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .no-print { display: none !important; }
          .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .print-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .print-subtitle { font-size: 14px; color: #666; }
          .print-date-range { text-align: center; margin-bottom: 20px; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .summary-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; display: inline-block; width: 200px; margin-right: 15px; }
          .summary-title { font-size: 12px; color: #666; margin-bottom: 5px; }
          .summary-value { font-size: 18px; font-weight: bold; }
          .page-break { page-break-before: always; }
          svg { width: 16px !important; height: 16px !important; }
          .h-8 { height: 16px !important; }
          .w-8 { width: 16px !important; }
          .grid { display: block !important; }
          .grid > div { display: block !important; margin-bottom: 10px !important; }
          .flex { display: block !important; }
          .flex-shrink-0 { display: inline-block !important; margin-right: 10px !important; }
          .ml-5 { margin-left: 10px !important; }
          .space-y-6 > * + * { margin-top: 20px !important; }
          .space-y-3 > * + * { margin-top: 10px !important; }
          .gap-4 { gap: 10px !important; }
          .p-6 { padding: 15px !important; }
          .p-4 { padding: 10px !important; }
          .rounded-lg { border-radius: 4px !important; }
          .shadow { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      </style>
    `;
    
    // Get current tab name
    const currentTabName = tabs.find(tab => tab.id === activeTab)?.name || 'Report';
    
    // Create print document
    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentTabName} - ${dateRange.startDate} to ${dateRange.endDate}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">Hotel Management System</div>
            <div class="print-subtitle">${currentTabName}</div>
          </div>
          <div class="print-date-range">
            Report Period: ${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}
          </div>
          ${printContent ? printContent.innerHTML : ''}
        </body>
      </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printDocument);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
      case 'bookings': return bookingReports.bookings || [];
      case 'revenue': return [];
      case 'occupancy': return [];
      case 'guests': return [];
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
    const numValue = Number(value) || 0;
    return `${numValue.toFixed(1)}%`;
  };

  const renderBookingReports = () => (
    <div className="space-y-6">
      {/* Summary Stats - Simple One Line */}
      <div className="mb-4 text-center">
        <span className="text-lg text-gray-700">
          <strong>Total Bookings:</strong> {bookingReports.summary?.totalBookings || 0} | 
          <strong> Total Revenue:</strong> {formatCurrency(bookingReports.summary?.totalRevenue)}
        </span>
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
                  <div className="text-sm text-gray-900">{booking.bookingNumber}</div>
                </td>
                <td className="table-cell">
                  <div className="text-sm text-gray-900">
                    {booking.guest?.firstName} {booking.guest?.lastName}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-sm text-gray-900">
                    Room {booking.room?.roomNumber}
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">{booking.duration}h</span>
                </td>
                <td className="table-cell">
                  <span className="text-sm text-gray-900">
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
                    {formatDate(booking.createdAt)}
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
                <dt className="text-sm text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-lg text-gray-900">
                  {formatCurrency(
                    revenueReports.revenueOverTime?.reduce((sum, r) => sum + (r.totalRevenue || 0), 0) || 0
                  )}
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
                <dt className="text-sm text-gray-500 truncate">Total Bookings</dt>
                <dd className="text-lg text-gray-900">
                  {revenueReports.revenueOverTime?.reduce((sum, r) => sum + (r.totalBookings || 0), 0) || 0}
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
                <dt className="text-sm text-gray-500 truncate">Average Revenue</dt>
                <dd className="text-lg text-gray-900">
                  {formatCurrency(
                    revenueReports.revenueOverTime?.reduce((sum, r) => sum + (r.averageBookingValue || 0), 0) / 
                    (revenueReports.revenueOverTime?.length || 1) || 0
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Room Type */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg text-gray-900 mb-4">Revenue by Room Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(revenueReports.revenueByRoomType || []).map(item => (
            <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl text-gray-900">{formatCurrency(item.totalRevenue)}</div>
              <div className="text-sm text-gray-600">{item._id}</div>
              <div className="text-xs text-gray-500">{item.totalBookings} bookings</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Duration */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg text-gray-900 mb-4">Revenue by Duration</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(revenueReports.revenueByDuration || []).map(item => (
            <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-xl text-gray-900">{formatCurrency(item.totalRevenue)}</div>
              <div className="text-sm text-gray-600">{item._id}h Bookings</div>
              <div className="text-xs text-gray-500">{item.totalBookings} bookings</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOccupancyReports = () => (
    <div className="space-y-6">
      {/* Overall Occupancy */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm text-gray-500 truncate">Total Rooms</dt>
                <dd className="text-lg text-gray-900">{occupancyReports.overall?.totalRooms || 0}</dd>
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
                <dt className="text-sm text-gray-500 truncate">Occupied Rooms</dt>
                <dd className="text-lg text-gray-900">{occupancyReports.overall?.occupiedRooms || 0}</dd>
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
                <dt className="text-sm text-gray-500 truncate">Available Rooms</dt>
                <dd className="text-lg text-gray-900">{occupancyReports.overall?.availableRooms || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm text-gray-500 truncate">Occupancy Rate</dt>
                <dd className="text-lg text-gray-900">{formatPercentage(occupancyReports.overall?.occupancyRate)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy by Room Type */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg text-gray-900 mb-4">Occupancy by Room Type</h3>
        {(occupancyReports.occupancyByType || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {occupancyReports.occupancyByType.map(item => (
              <div key={item._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-lg text-gray-900 mb-2">{item._id}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total Rooms:</span>
                    <span>{item.totalRooms}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Occupied:</span>
                    <span>{item.occupiedRooms}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span>{item.availableRooms}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Occupancy Rate:</span>
                    <span>{formatPercentage(item.occupancyRate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">No occupancy data available for the selected date range.</div>
          </div>
        )}
      </div>

      {/* Peak Hours */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg text-gray-900 mb-4">Peak Check-in Hours</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {(occupancyReports.peakHours || []).map(item => (
            <div key={item._id} className="text-center p-2 bg-gray-50 rounded">
              <div className="text-sm font-semibold">{item._id}:00</div>
              <div className="text-xs text-gray-600">{item.checkIns} check-ins</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGuestReports = () => (
    <div className="space-y-6">
      {/* Guest Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm text-gray-500 truncate">Total Guests</dt>
                <dd className="text-lg text-gray-900">{guestReports.totalGuests || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm text-gray-500 truncate">New Guests</dt>
                <dd className="text-lg text-gray-900">{guestReports.newGuests || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm text-gray-500 truncate">VIP Guests</dt>
                <dd className="text-lg text-gray-900">{guestReports.vipGuests || 0}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm text-gray-500 truncate">Repeat Guests</dt>
                <dd className="text-lg text-gray-900">{guestReports.repeatGuests?.length || 0}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Nationality Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg text-gray-900 mb-4">Guest Nationality Breakdown</h3>
        {(guestReports.nationalityBreakdown || []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guestReports.nationalityBreakdown.map(item => (
              <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{item._id || 'Not specified'}</span>
                <span className="text-sm font-semibold text-gray-700">{item.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">No nationality data available for the selected date range.</div>
          </div>
        )}
      </div>

      {/* Top Repeat Guests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg text-gray-900 mb-4">Top Repeat Guests</h3>
        {(guestReports.repeatGuests || []).length > 0 ? (
          <div className="space-y-3">
            {guestReports.repeatGuests.slice(0, 10).map(item => (
              <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.guest?.firstName} {item.guest?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{item.guest?.email}</div>
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  {item.bookingCount} bookings
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">No repeat guest data available for the selected date range.</div>
          </div>
        )}
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">
              Comprehensive reports and analytics for hotel operations.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="btn btn-primary no-print flex-shrink-0"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 no-print">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-700">Date Range:</span>
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


      {/* Report Content */}
      <div id="report-content">
        {renderTabContent()}
      </div>

      {/* Pagination for tables */}
      {(['bookings'].includes(activeTab) && getCurrentData().length > itemsPerPage) && (
        <div className="no-print">
          <Pagination
            currentPage={currentPage}
            totalItems={getCurrentData().length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
