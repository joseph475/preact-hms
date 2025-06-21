import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import apiService from '../../../services/api';
import { useSearch } from '../../../hooks/useSearch';
import Modal from '../../common/Modal';
import DeleteConfirmationModal from '../../common/DeleteConfirmationModal';
import ConfirmationModal from '../../common/ConfirmationModal';
import Pagination from '../../common/Pagination';
import TimeRemaining from '../../common/TimeRemaining';

const BookingsPage = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const { searchTerm, updateCurrentPage } = useSearch();
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [bookingToMarkNoShow, setBookingToMarkNoShow] = useState(null);
  const [noShowNotes, setNoShowNotes] = useState('');
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [bookingToCheckOut, setBookingToCheckOut] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bookingToViewDetails, setBookingToViewDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [formData, setFormData] = useState({
    guest: {
      firstName: '',
      lastName: '',
      phone: '',
      idType: 'National ID',
      idNumber: ''
    },
    room: '',
    checkInDate: '',
    checkInTime: '',
    duration: '3',
    bookingStatus: 'Confirmed',
    totalAmount: 0,
    paymentStatus: 'Pending',
    paymentMethod: 'Cash',
    specialRequests: '',
    guestCount: 1
  });

  const bookingStatuses = ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'No Show'];
  const paymentStatuses = ['Pending', 'Paid', 'Partial', 'Refunded'];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online Payment'];
  const durations = [
    { value: '3', label: '3 Hours' },
    { value: '8', label: '8 Hours' },
    { value: '12', label: '12 Hours' },
    { value: '24', label: '24 Hours (Daily)' }
  ];

  useEffect(() => {
    updateCurrentPage('/bookings');
    loadData();
    
    // Check for pre-selected room from localStorage
    const selectedRoomData = localStorage.getItem('selectedRoomForBooking');
    if (selectedRoomData) {
      try {
        const roomData = JSON.parse(selectedRoomData);
        // Pre-fill the room selection
        setFormData(prev => ({
          ...prev,
          room: roomData.id
        }));
        // Open the booking modal automatically and go to step 2
        setCurrentStep(2);
        setShowModal(true);
        // Clear the localStorage after using it
        localStorage.removeItem('selectedRoomForBooking');
      } catch (error) {
        console.error('Error parsing selected room data:', error);
        localStorage.removeItem('selectedRoomForBooking');
      }
    }

  }, []);

  useEffect(() => {
    calculateTotalAmount();
  }, [formData.room, formData.duration]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, roomsRes, guestsRes] = await Promise.all([
        apiService.getBookings(),
        apiService.getRooms(),
        apiService.getGuests()
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (roomsRes.success) {
        // For editing purposes, we need to include all rooms, not just available ones
        // We'll filter available rooms in the room selection UI instead
        setRooms(roomsRes.data);
      }
      if (guestsRes.success) setGuests(guestsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    const selectedRoom = rooms.find(room => room._id === formData.room);
    if (selectedRoom && selectedRoom.roomType?.pricing) {
      let amount = 0;
      const pricing = selectedRoom.roomType.pricing;
      
      console.log('Selected room:', selectedRoom);
      console.log('Pricing:', pricing);
      console.log('Duration:', formData.duration);
      
      switch (formData.duration) {
        case '3':
          amount = pricing.hourly3 || 0;
          break;
        case '8':
          amount = pricing.hourly8 || 0;
          break;
        case '12':
          amount = pricing.hourly12 || 0;
          break;
        case '24':
          amount = pricing.daily || 0;
          break;
        default:
          amount = 0;
      }
      
      console.log('Calculated amount:', amount);
      setFormData(prev => ({ ...prev, totalAmount: amount }));
    } else {
      console.log('No room selected or no pricing available');
      setFormData(prev => ({ ...prev, totalAmount: 0 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate date and time inputs
      if (!formData.checkInDate || !formData.checkInTime) {
        setError('Please provide both check-in date and time');
        setLoading(false);
        return;
      }
      
      // Create a more robust date object using a different approach
      const dateStr = formData.checkInDate; // YYYY-MM-DD format
      const timeStr = formData.checkInTime; // HH:MM format
      
      // Validate input formats
      if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/) || !timeStr.match(/^\d{2}:\d{2}$/)) {
        setError('Invalid date or time format');
        setLoading(false);
        return;
      }
      
      // Validate totalAmount first
      const totalAmount = parseFloat(formData.totalAmount);
      if (isNaN(totalAmount) || totalAmount < 0) {
        setError('Please select a room to calculate the total amount');
        setLoading(false);
        return;
      }
      
      // Create date in local timezone to avoid UTC conversion issues
      const dateTimeString = `${dateStr}T${timeStr}:00`;
      const checkInDateTime = new Date(dateTimeString);
      
      // Validate the created date
      if (isNaN(checkInDateTime.getTime())) {
        setError(`Failed to create valid date from: ${dateStr} ${timeStr}`);
        setLoading(false);
        return;
      }
      
      console.log('Date created successfully:', checkInDateTime.toISOString());
      
      const bookingData = {
        guest: formData.guest,
        room: formData.room,
        checkInDate: checkInDateTime.toISOString(),
        duration: parseInt(formData.duration),
        guestCount: parseInt(formData.guestCount),
        totalAmount: totalAmount,
        bookingStatus: formData.bookingStatus,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        specialRequests: formData.specialRequests
      };
      
      console.log('Final booking data:', bookingData);

      if (editingBooking) {
        const response = await apiService.updateBooking(editingBooking._id, bookingData);
        if (response.success) {
          await loadData();
          resetForm();
          setShowModal(false);
        }
      } else {
        const response = await apiService.createBooking(bookingData);
        if (response.success) {
          await loadData();
          resetForm();
          setShowModal(false);
        }
      }
    } catch (err) {
      setError(editingBooking ? 'Failed to update booking' : 'Failed to create booking');
      console.error('Booking operation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    const checkInDate = new Date(booking.checkInDate);
    setFormData({
      guest: {
        firstName: booking.guest?.firstName || '',
        lastName: booking.guest?.lastName || '',
        phone: booking.guest?.phone || '',
        idType: booking.guest?.idType || 'National ID',
        idNumber: booking.guest?.idNumber || ''
      },
      room: booking.room._id,
      checkInDate: checkInDate.toISOString().split('T')[0],
      checkInTime: checkInDate.toTimeString().slice(0, 5),
      duration: booking.duration.toString(),
      bookingStatus: booking.bookingStatus,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod || 'Cash',
      specialRequests: booking.specialRequests || '',
      guestCount: booking.guestCount || 1
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    
    try {
      setLoading(true);
      const response = await apiService.deleteBooking(bookingToDelete._id);
      if (response.success) {
        await loadData();
        setShowDeleteModal(false);
        setBookingToDelete(null);
      }
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Delete booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setLoading(true);
      // Set check-in time to current time when button is clicked
      const actualCheckInTime = new Date().toISOString();
      const response = await apiService.updateBooking(bookingId, { 
        bookingStatus: 'Checked In',
        checkInDate: actualCheckInTime
      });
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      setError('Failed to check in');
      console.error('Check in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOutClick = (booking) => {
    setBookingToCheckOut(booking);
    setShowCheckOutModal(true);
  };

  const handleCheckOutConfirm = async () => {
    if (!bookingToCheckOut) return;
    
    try {
      setLoading(true);
      const response = await apiService.updateBooking(bookingToCheckOut._id, { 
        bookingStatus: 'Checked Out',
        paymentStatus: 'Paid',
        paidAmount: bookingToCheckOut.totalAmount // Set paid amount to total amount
      });
      if (response.success) {
        await loadData();
        setShowCheckOutModal(false);
        setBookingToCheckOut(null);
      }
    } catch (err) {
      setError('Failed to check out');
      console.error('Check out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOutCancel = () => {
    setShowCheckOutModal(false);
    setBookingToCheckOut(null);
  };

  const handleViewDetails = (booking) => {
    setBookingToViewDetails(booking);
    setShowDetailsModal(true);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setBookingToViewDetails(null);
  };

  const handleCancel = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason === null) return; // User cancelled the prompt
    
    try {
      setLoading(true);
      const response = await apiService.cancelBooking(bookingId, reason);
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Cancel booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNoShow = (booking) => {
    setBookingToMarkNoShow(booking);
    setNoShowNotes('');
    setShowNoShowModal(true);
  };

  const handleNoShowConfirm = async () => {
    if (!bookingToMarkNoShow) return;
    
    try {
      setLoading(true);
      const response = await apiService.markNoShow(bookingToMarkNoShow._id, noShowNotes);
      if (response.success) {
        await loadData();
        setShowNoShowModal(false);
        setBookingToMarkNoShow(null);
        setNoShowNotes('');
      }
    } catch (err) {
      setError('Failed to mark as no show');
      console.error('Mark no show error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNoShowCancel = () => {
    setShowNoShowModal(false);
    setBookingToMarkNoShow(null);
    setNoShowNotes('');
  };

  const resetForm = () => {
    setFormData({
      guest: {
        firstName: '',
        lastName: '',
        phone: '',
        idType: 'National ID',
        idNumber: ''
      },
      room: '',
      checkInDate: '',
      checkInTime: '',
      duration: '3',
      bookingStatus: 'Confirmed',
      totalAmount: 0,
      paymentStatus: 'Pending',
      paymentMethod: 'Cash',
      specialRequests: '',
      guestCount: 1
    });
    setEditingBooking(null);
    setCurrentStep(1);
    setRoomSearchTerm('');
    setRoomTypeFilter('');
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToStep2 = () => {
    return formData.guest.firstName && formData.guest.lastName && 
           formData.guest.phone && formData.guest.idNumber;
  };

  const canProceedToStep3 = () => {
    return formData.room && formData.checkInDate && formData.checkInTime;
  };

  // Get unique room types for filtering
  const roomTypes = [...new Set(rooms.map(room => 
    typeof room.roomType === 'object' ? room.roomType?.name : room.roomType
  ).filter(Boolean))];

  const handleInputChange = (field, value) => {
    if (field.startsWith('guest.')) {
      const guestField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        guest: {
          ...prev.guest,
          [guestField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      booking.guest?.firstName?.toLowerCase().includes(searchLower) ||
      booking.guest?.lastName?.toLowerCase().includes(searchLower) ||
      booking.room?.roomNumber?.includes(searchTerm)
    );
    
    // Status filtering logic
    let matchesStatus = true;
    if (statusFilter) {
      // If a specific status is selected, show only that status
      matchesStatus = booking.bookingStatus === statusFilter;
    } else {
      // If no status filter is selected, hide completed/inactive bookings by default
      const hiddenStatuses = ['Checked Out', 'No Show', 'Cancelled'];
      matchesStatus = !hiddenStatuses.includes(booking.bookingStatus);
    }
    
    return matchesSearch && matchesStatus;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Get paginated bookings
  const getPaginatedBookings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBookings.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Confirmed': 'badge-info',
      'Checked In': 'badge-success',
      'Checked Out': 'badge-secondary',
      'Cancelled': 'badge-danger',
      'No Show': 'badge-warning'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const getPaymentBadge = (status) => {
    const statusClasses = {
      'Pending': 'badge-warning',
      'Paid': 'badge-success',
      'Partial': 'badge-info',
      'Refunded': 'badge-secondary'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateCheckOutTime = (checkInDate, duration) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkIn.getTime() + (duration * 60 * 60 * 1000));
    return checkOut.toLocaleString();
  };

  const getRemainingTime = (checkInDate, duration) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkIn.getTime() + (duration * 60 * 60 * 1000));
    const now = new Date();
    const remainingMs = checkOut.getTime() - now.getTime();
    
    if (remainingMs <= 0) {
      return { minutes: 0, isOverdue: true };
    }
    
    const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
    return { 
      minutes: remainingMinutes, 
      isOverdue: false,
      isNearExpiry: remainingMinutes <= 20 && remainingMinutes > 0
    };
  };

  const formatRemainingTime = (minutes) => {
    if (minutes <= 0) return 'Overdue';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m left`;
    }
    return `${mins}m left`;
  };

  if (loading && bookings.length === 0) {
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
            <h1 className="page-title">Bookings Management</h1>
            <p className="page-subtitle">
              Manage hotel bookings and reservations efficiently.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Booking
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Filters Section */}
      {bookings.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {bookingStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            )}

            {/* Active Filters Display */}
            <div className="flex items-center space-x-2">
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Guest Information</th>
              <th className="table-header-cell">Room Details</th>
              <th className="table-header-cell">Schedule</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Payment</th>
              <th className="table-header-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {getPaginatedBookings().map((booking) => (
              <tr key={booking._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.guest?.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Room {booking.room?.roomNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {typeof booking.room?.roomType === 'object' ? booking.room?.roomType?.name : booking.room?.roomType}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(booking.checkInDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Duration: {booking.duration}h
                    </div>
                    <div className="text-xs text-gray-500">
                      Out: {calculateCheckOutTime(booking.checkInDate, booking.duration)}
                    </div>
                    <TimeRemaining 
                      checkInDate={booking.checkInDate}
                      duration={booking.duration}
                      bookingStatus={booking.bookingStatus}
                    />
                  </div>
                </td>
                <td className="table-cell">
                  <span className="text-sm font-bold text-gray-900">
                    ₱{booking.totalAmount?.toLocaleString()}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${getStatusBadge(booking.bookingStatus)}`}>
                    <span className={`status-dot-${
                      booking.bookingStatus === 'Confirmed' ? 'blue' :
                      booking.bookingStatus === 'Checked In' ? 'green' :
                      booking.bookingStatus === 'Checked Out' ? 'gray' :
                      booking.bookingStatus === 'Cancelled' ? 'red' : 'yellow'
                    }`}></span>
                    {booking.bookingStatus}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${getPaymentBadge(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="action-buttons justify-end">
                    {booking.bookingStatus === 'Confirmed' && (
                      <>
                        <button
                          onClick={() => handleCheckIn(booking._id)}
                          className="action-btn-success"
                          title="Check In Guest"
                        >
                          Check In
                        </button>
                        <button
                          onClick={() => handleMarkNoShow(booking)}
                          className="action-btn-warning"
                          title="Mark as No Show"
                        >
                          No Show
                        </button>
                      </>
                    )}
                    {booking.bookingStatus === 'Checked In' && (
                      <button
                        onClick={() => handleCheckOutClick(booking)}
                        className="action-btn-primary"
                        title="Check Out Guest"
                      >
                        Check Out
                      </button>
                    )}
                    {booking.bookingStatus === 'Checked Out' && (
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="action-btn-info"
                        title="View Checkout Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                    {booking.bookingStatus !== 'Checked Out' && (
                      <button
                        onClick={() => handleEdit(booking)}
                        className="action-btn-primary"
                        title="Edit Booking"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {(booking.bookingStatus !== 'Cancelled' && booking.bookingStatus !== 'Checked Out') && (
                      <button
                        onClick={() => handleDeleteClick(booking)}
                        className="action-btn-danger"
                        title="Delete Booking"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredBookings.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>

      {filteredBookings.length === 0 && !loading && (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="empty-state-title">
            {searchTerm || statusFilter ? 'No bookings found' : 'No bookings'}
          </h3>
          <p className="empty-state-description">
            {searchTerm || statusFilter ? 'Try adjusting your search terms or filters.' : 'Get started by creating a new booking for your guests.'}
          </p>
        </div>
      )}

      {/* Modal with Step-by-Step Wizard */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${editingBooking ? 'Edit' : 'New'} Booking - Step ${currentStep} of 3`}
        size="large"
        closeOnOverlayClick={false}
        footer={
          <div className="flex items-center justify-between w-full">
            {/* Left side - Step navigation */}
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-outline"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
              )}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                  disabled={
                    (currentStep === 1 && !canProceedToStep2()) ||
                    (currentStep === 2 && !canProceedToStep3())
                  }
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="spinner mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    editingBooking ? 'Update Booking' : 'Create Booking'
                  )}
                </button>
              )}
            </div>
          </div>
        }
      >
        {/* Step Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : step < currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <div className="ml-3 text-sm font-medium">
                  {step === 1 && 'Guest Info'}
                  {step === 2 && 'Room & Booking'}
                  {step === 3 && 'Payment & Details'}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Guest Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
                <p className="text-sm text-gray-600">Please provide the guest's personal details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.guest.firstName}
                    onChange={(e) => handleInputChange('guest.firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.guest.lastName}
                    onChange={(e) => handleInputChange('guest.lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.guest.phone}
                  onChange={(e) => handleInputChange('guest.phone', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">ID Type</label>
                  <select
                    className="form-select"
                    value={formData.guest.idType}
                    onChange={(e) => handleInputChange('guest.idType', e.target.value)}
                  >
                    <option value="National ID">National ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ID Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.guest.idNumber}
                    onChange={(e) => handleInputChange('guest.idNumber', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Room & Booking Details */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Perfect Room</h3>
                <p className="text-gray-600 max-w-md mx-auto">Select from our available rooms and set your booking preferences</p>
              </div>

              {/* Room Selection */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Room Selection
                  </h4>
                  {formData.room && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('room', '')}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Change Room
                    </button>
                  )}
                </div>
                
                {/* Selected Room Display */}
                {formData.room && (
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -mr-16 -mt-16"></div>
                    {(() => {
                      const selectedRoom = rooms.find(room => room._id === formData.room);
                      return selectedRoom ? (
                        <div className="relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl font-bold text-white">{selectedRoom.roomNumber}</span>
                              </div>
                              <div>
                                <h5 className="text-xl font-bold text-gray-900">Room {selectedRoom.roomNumber}</h5>
                                <p className="text-blue-700 font-medium">
                                  {typeof selectedRoom.roomType === 'object' ? selectedRoom.roomType?.name : selectedRoom.roomType}
                                </p>
                                <div className="flex items-center mt-1">
                                  {selectedRoom.status === 'Available' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                      Available
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                                      {selectedRoom.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Selected
                              </div>
                            </div>
                          </div>
                          
                          {selectedRoom.roomType?.pricing && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                              <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                Pricing Options
                              </h6>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                  { duration: '3h', price: selectedRoom.roomType.pricing.hourly3, label: '3 Hours' },
                                  { duration: '8h', price: selectedRoom.roomType.pricing.hourly8, label: '8 Hours' },
                                  { duration: '12h', price: selectedRoom.roomType.pricing.hourly12, label: '12 Hours' },
                                  { duration: '24h', price: selectedRoom.roomType.pricing.daily, label: 'Daily' }
                                ].map(option => (
                                  <div key={option.duration} className="text-center p-2 bg-white rounded-lg border border-gray-200">
                                    <div className="text-xs text-gray-600 font-medium">{option.label}</div>
                                    <div className="text-sm font-bold text-gray-900">₱{option.price?.toLocaleString()}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Room Search and Selection */}
                {!formData.room && (
                  <div className="space-y-6">
                    {/* Enhanced Search Filters */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h5 className="font-semibold text-gray-900">Filter Rooms</h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Search by room number..."
                            className="form-input pl-10"
                            value={roomSearchTerm}
                            onChange={(e) => setRoomSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <select
                            className="form-select pl-10"
                            value={roomTypeFilter}
                            onChange={(e) => setRoomTypeFilter(e.target.value)}
                          >
                            <option value="">All Room Types</option>
                            {roomTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Room Cards Grid */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-gray-900">Available Rooms</h5>
                        <span className="text-sm text-gray-600">
                          {rooms.filter(room => {
                            const searchLower = roomSearchTerm.toLowerCase();
                            const roomTypeName = typeof room.roomType === 'object' ? room.roomType?.name : room.roomType;
                            const matchesSearch = room.roomNumber.toLowerCase().includes(searchLower);
                            const matchesType = !roomTypeFilter || roomTypeName === roomTypeFilter;
                            return matchesSearch && matchesType;
                          }).length} rooms available
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                        {rooms
                          .filter(room => {
                            const searchLower = roomSearchTerm.toLowerCase();
                            const roomTypeName = typeof room.roomType === 'object' ? room.roomType?.name : room.roomType;
                            const matchesSearch = room.roomNumber.toLowerCase().includes(searchLower);
                            const matchesType = !roomTypeFilter || roomTypeName === roomTypeFilter;
                            
                            // Room availability logic:
                            // - For new bookings: only show available rooms
                            // - For editing: show available rooms + the currently selected room (even if occupied)
                            let isSelectable = false;
                            if (editingBooking) {
                              // When editing, allow available rooms OR the room that's currently being edited
                              isSelectable = room.status === 'Available' || room._id === editingBooking.room._id;
                            } else {
                              // For new bookings, only available rooms
                              isSelectable = room.status === 'Available';
                            }
                            
                            return matchesSearch && matchesType && isSelectable;
                          })
                          .map(room => {
                            const roomTypeName = typeof room.roomType === 'object' ? room.roomType?.name : room.roomType;
                            const pricing = room.roomType?.pricing;
                            
                            return (
                              <div
                                key={room._id}
                                onClick={() => {
                                  handleInputChange('room', room._id);
                                  setRoomSearchTerm('');
                                }}
                                className="group relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1"
                              >
                                <div className="absolute top-4 right-4">
                                  {room.status === 'Available' ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                      Available
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                                      {room.status}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-start space-x-4 mb-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                    <span className="text-lg font-bold text-white">{room.roomNumber}</span>
                                  </div>
                                  <div className="flex-1">
                                    <h6 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      Room {room.roomNumber}
                                    </h6>
                                    <p className="text-gray-600 font-medium">{roomTypeName}</p>
                                  </div>
                                </div>
                                
                                {pricing && (
                                  <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-blue-50 transition-colors">
                                    <h6 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Pricing</h6>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { duration: '3h', price: pricing.hourly3, label: '3h' },
                                        { duration: '8h', price: pricing.hourly8, label: '8h' },
                                        { duration: '12h', price: pricing.hourly12, label: '12h' },
                                        { duration: '24h', price: pricing.daily, label: '24h' }
                                      ].map(option => (
                                        <div key={option.duration} className="text-center">
                                          <div className="text-xs text-gray-600">{option.label}</div>
                                          <div className="text-sm font-bold text-gray-900">₱{option.price?.toLocaleString()}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Max occupancy
                                  </div>
                                  <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    Select Room
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      
                      {rooms.filter(room => {
                        const searchLower = roomSearchTerm.toLowerCase();
                        const roomTypeName = typeof room.roomType === 'object' ? room.roomType?.name : room.roomType;
                        const matchesSearch = room.roomNumber.toLowerCase().includes(searchLower);
                        const matchesType = !roomTypeFilter || roomTypeName === roomTypeFilter;
                        return matchesSearch && matchesType;
                      }).length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Check-in Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.checkInDate}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-in Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.checkInTime}
                    onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <select
                    className="form-select"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  >
                    {durations.map(duration => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Guest Count</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Total Amount Display */}
              <div className="form-group">
                <label className="form-label">Total Amount</label>
                <div className="form-input bg-gray-50 text-gray-700 font-semibold text-lg">
                  ₱{formData.totalAmount.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Amount is automatically calculated based on room type and duration
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Payment & Additional Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment & Additional Details</h3>
                <p className="text-sm text-gray-600">Set payment information and any special requests</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Booking Status</label>
                  <select
                    className="form-select"
                    value={formData.bookingStatus}
                    onChange={(e) => handleInputChange('bookingStatus', e.target.value)}
                  >
                    {editingBooking ? (
                      // When editing, show all statuses
                      bookingStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))
                    ) : (
                      // When creating new booking, only show Confirmed and Checked In
                      ['Confirmed', 'Checked In'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                  >
                    {paymentStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requests</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requests, notes, or additional information..."
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <span>{formData.guest.firstName} {formData.guest.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span>
                      {(() => {
                        const selectedRoom = rooms.find(room => room._id === formData.room);
                        return selectedRoom ? `Room ${selectedRoom.roomNumber}` : 'Not selected';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span>{formData.checkInDate} at {formData.checkInTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{durations.find(d => d.value === formData.duration)?.label}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>₱{formData.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Cancel Booking"
        itemName={bookingToDelete ? `booking for ${bookingToDelete.guest?.firstName} ${bookingToDelete.guest?.lastName}` : 'this booking'}
        itemDetails={bookingToDelete ? `Room ${bookingToDelete.room?.roomNumber} - ${new Date(bookingToDelete.checkInDate).toLocaleDateString()}` : ''}
        warningMessage="This will cancel the booking and mark it as 'Cancelled'. The room will become available for new bookings. The booking record will be preserved for audit purposes."
        confirmButtonText="Cancel Booking"
        isLoading={loading}
      />

      {/* No Show Confirmation Modal */}
      <ConfirmationModal
        isOpen={showNoShowModal}
        onClose={handleNoShowCancel}
        onConfirm={handleNoShowConfirm}
        title="Mark as No Show"
        message="Are you sure you want to mark"
        itemName={bookingToMarkNoShow ? `booking for ${bookingToMarkNoShow.guest?.firstName} ${bookingToMarkNoShow.guest?.lastName}` : 'this booking'}
        itemDetails={bookingToMarkNoShow ? `Room ${bookingToMarkNoShow.room?.roomNumber} - ${new Date(bookingToMarkNoShow.checkInDate).toLocaleDateString()}` : ''}
        warningMessage="This will mark the booking as no-show, make the room available, and save the guest details to the guest list with a no-show note."
        confirmButtonText="Mark as No Show"
        confirmButtonClass="btn-warning"
        isLoading={loading}
        showTextArea={true}
        textAreaLabel="Additional Notes (Optional)"
        textAreaPlaceholder="Add any notes about the no-show incident..."
        textAreaValue={noShowNotes}
        onTextAreaChange={setNoShowNotes}
        icon={
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        }
      />

      {/* Check Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCheckOutModal}
        onClose={handleCheckOutCancel}
        onConfirm={handleCheckOutConfirm}
        title="Check Out Guest"
        message="Are you sure you want to check out"
        itemName={bookingToCheckOut ? `${bookingToCheckOut.guest?.firstName} ${bookingToCheckOut.guest?.lastName}` : 'this guest'}
        itemDetails={bookingToCheckOut ? `Room ${bookingToCheckOut.room?.roomNumber} - ₱${bookingToCheckOut.totalAmount?.toLocaleString()}` : ''}
        warningMessage="This will mark the booking as checked out and automatically set the payment status to 'Paid'. The room will become available for new bookings."
        confirmButtonText="Check Out & Mark Paid"
        confirmButtonClass="btn-primary"
        isLoading={loading}
        icon={
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Checkout Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={handleDetailsModalClose}
        title="Checkout Details"
        size="large"
      >
        {bookingToViewDetails && (
          <div className="space-y-6">
            {/* Header with booking status */}
            <div className="text-center pb-6 border-b border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Checkout Completed</h3>
              <p className="text-gray-600">Booking #{bookingToViewDetails.bookingNumber || bookingToViewDetails._id?.slice(-8)}</p>
            </div>

            {/* Guest Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Guest Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-900 font-semibold">{bookingToViewDetails.guest?.firstName} {bookingToViewDetails.guest?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone Number</label>
                  <p className="text-gray-900">{bookingToViewDetails.guest?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ID Type</label>
                  <p className="text-gray-900">{bookingToViewDetails.guest?.idType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ID Number</label>
                  <p className="text-gray-900">{bookingToViewDetails.guest?.idNumber}</p>
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Room Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Room Number</label>
                  <p className="text-gray-900 font-semibold">Room {bookingToViewDetails.room?.roomNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Room Type</label>
                  <p className="text-gray-900">{typeof bookingToViewDetails.room?.roomType === 'object' ? bookingToViewDetails.room?.roomType?.name : bookingToViewDetails.room?.roomType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-gray-900">{bookingToViewDetails.duration} hours</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Guest Count</label>
                  <p className="text-gray-900">{bookingToViewDetails.guestCount} guest{bookingToViewDetails.guestCount > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Timing Information */}
            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timing Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Scheduled Check-in</label>
                    <p className="text-gray-900 font-semibold">{formatDateTime(bookingToViewDetails.checkInDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Actual Check-in</label>
                    <p className="text-gray-900 font-semibold">
                      {bookingToViewDetails.actualCheckIn ? formatDateTime(bookingToViewDetails.actualCheckIn) : 'Not recorded'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Scheduled Check-out</label>
                    <p className="text-gray-900 font-semibold">{calculateCheckOutTime(bookingToViewDetails.checkInDate, bookingToViewDetails.duration)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Actual Check-out</label>
                    <p className="text-gray-900 font-semibold">
                      {bookingToViewDetails.actualCheckOut ? formatDateTime(bookingToViewDetails.actualCheckOut) : 'Not recorded'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Duration Summary */}
              {bookingToViewDetails.actualCheckIn && bookingToViewDetails.actualCheckOut && (
                <div className="mt-6 pt-4 border-t border-green-200">
                  <div className="bg-white rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Total Stay Duration</label>
                    <p className="text-lg font-bold text-green-600">
                      {(() => {
                        const checkIn = new Date(bookingToViewDetails.actualCheckIn);
                        const checkOut = new Date(bookingToViewDetails.actualCheckOut);
                        const durationMs = checkOut.getTime() - checkIn.getTime();
                        const hours = Math.floor(durationMs / (1000 * 60 * 60));
                        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                        return `${hours}h ${minutes}m`;
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-yellow-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Payment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Amount</label>
                  <p className="text-2xl font-bold text-gray-900">₱{bookingToViewDetails.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Paid Amount</label>
                  <p className="text-xl font-semibold text-green-600">₱{bookingToViewDetails.paidAmount?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentBadge(bookingToViewDetails.paymentStatus)}`}>
                    {bookingToViewDetails.paymentStatus}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="text-gray-900">{bookingToViewDetails.paymentMethod || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(bookingToViewDetails.specialRequests || bookingToViewDetails.notes) && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Additional Information
                </h4>
                {bookingToViewDetails.specialRequests && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-600">Special Requests</label>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border">{bookingToViewDetails.specialRequests}</p>
                  </div>
                )}
                {bookingToViewDetails.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Notes</label>
                    <p className="text-gray-900 bg-white p-3 rounded-lg border">{bookingToViewDetails.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Booking Metadata */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Booking Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(bookingToViewDetails.bookingStatus)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      bookingToViewDetails.bookingStatus === 'Checked Out' ? 'bg-gray-400' : 'bg-current'
                    }`}></span>
                    {bookingToViewDetails.bookingStatus}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created By</label>
                  <p className="text-gray-900">{bookingToViewDetails.createdBy?.name || 'System'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Booking Created</label>
                  <p className="text-gray-900">{formatDateTime(bookingToViewDetails.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-gray-900">{formatDateTime(bookingToViewDetails.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingsPage;
