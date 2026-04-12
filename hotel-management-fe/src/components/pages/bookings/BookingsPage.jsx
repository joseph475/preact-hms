import { h, Fragment } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { useSearch } from '../../../hooks/useSearch';
import { useBookings } from '../../../hooks/useBookings';
import DeleteConfirmationModal from '../../common/DeleteConfirmationModal';
import ConfirmationModal from '../../common/ConfirmationModal';
import Pagination from '../../common/Pagination';
import BookingFilters from './components/BookingFilters';
import BookingTableRow from './components/BookingTableRow';
import BookingModal from './components/BookingModal/BookingModal';
import BookingDetailsModal from './components/BookingDetailsModal';
import TimeRemaining from '../../common/TimeRemaining';
import Receipt from '../../common/Receipt';
import FoodOrderModal from '../../common/FoodOrderModal';
import ExtendStayModal from '../../common/ExtendStayModal';

const BookingsPage = ({ user }) => {
  const {
    bookings,
    rooms,
    guests,
    loading,
    error,
    setError,
    handleCheckIn,
    handleCheckOut,
    handleMarkNoShow,
    handleDelete,
    createBooking,
    updateBooking,
    handleAddFoodOrder,
    handleRemoveFoodOrder,
    handleExtendBooking,
  } = useBookings();

  const { searchTerm, updateCurrentPage } = useSearch();
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [bookingToMarkNoShow, setBookingToMarkNoShow] = useState(null);
  const [noShowNotes, setNoShowNotes] = useState('');
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [bookingToCheckOut, setBookingToCheckOut] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bookingToViewDetails, setBookingToViewDetails] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [showFoodOrderModal, setShowFoodOrderModal] = useState(false);
  const [bookingForFoodOrder, setBookingForFoodOrder] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [bookingToExtend, setBookingToExtend] = useState(null);

  // Filter and pagination states
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [viewMode, setViewMode] = useState(() => {
    // Load view preference from localStorage, default to 'cards'
    return localStorage.getItem('bookingsViewMode') || 'cards';
  });

  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  
  // Get current date and time for initial state
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toISOString().split('T')[0], // YYYY-MM-DD format
      time: now.toTimeString().slice(0, 5)   // HH:MM format
    };
  };
  
  const [formData, setFormData] = useState(() => {
    const { date, time } = getCurrentDateTime();
    return {
      guest: {
        firstName: '',
        lastName: '',
        phone: '',
        idType: 'National ID',
        idNumber: '',
        nationality: '',
        isVip: false
      },
      room: '',
      checkInDate: date,
      checkInTime: time,
      duration: '3',
      bookingStatus: 'Confirmed',
      totalAmount: 0,
      paymentStatus: 'Pending',
      paymentMethod: 'Cash',
      specialRequests: '',
      guestCount: 1
    };
  });

  // Constants
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
        // Open the booking modal automatically and start at step 1
        setCurrentStep(1);
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
  }, [formData.room, formData.duration, rooms]);

  const calculateTotalAmount = () => {
    const selectedRoom = rooms.find(room => room._id === formData.room);
    if (selectedRoom && selectedRoom.roomType?.pricing) {
      let amount = 0;
      const pricing = selectedRoom.roomType.pricing;
      
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
      
      setFormData(prev => ({ ...prev, totalAmount: amount }));
    } else {
      setFormData(prev => ({ ...prev, totalAmount: 0 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate date and time inputs
    if (!formData.checkInDate || !formData.checkInTime) {
      setError('Please provide both check-in date and time');
      return;
    }
    
    // Create a more robust date object using a different approach
    const dateStr = formData.checkInDate; // YYYY-MM-DD format
    const timeStr = formData.checkInTime; // HH:MM format
    
    // Validate input formats
    if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/) || !timeStr.match(/^\d{2}:\d{2}$/)) {
      setError('Invalid date or time format');
      return;
    }
    
    // Validate totalAmount first
    const totalAmount = parseFloat(formData.totalAmount);
    if (isNaN(totalAmount) || totalAmount < 0) {
      setError('Please select a room to calculate the total amount');
      return;
    }
    
    // Create date in local timezone to avoid UTC conversion issues
    const dateTimeString = `${dateStr}T${timeStr}:00`;
    const checkInDateTime = new Date(dateTimeString);
    
    // Validate the created date
    if (isNaN(checkInDateTime.getTime())) {
      setError(`Failed to create valid date from: ${dateStr} ${timeStr}`);
      return;
    }
    
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

    let result;
    if (editingBooking) {
      result = await updateBooking(editingBooking._id, bookingData);
    } else {
      result = await createBooking(bookingData);
    }

    if (result.success) {
      resetForm();
      setShowModal(false);
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
        idNumber: booking.guest?.idNumber || '',
        nationality: booking.guest?.nationality || '',
        isVip: booking.guest?.isVip || false
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
    
    await handleDelete(bookingToDelete._id);
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const handleCheckOutClick = (booking) => {
    setBookingToCheckOut(booking);
    setShowCheckOutModal(true);
  };

  const handleCheckOutConfirm = async () => {
    if (!bookingToCheckOut) return;
    
    await handleCheckOut(bookingToCheckOut._id);
    
    // Show receipt after successful checkout
    const updatedBooking = {
      ...bookingToCheckOut,
      bookingStatus: 'Checked Out',
      paymentStatus: 'Paid'
    };
    setReceiptBooking(updatedBooking);
    setShowReceipt(true);
    
    setShowCheckOutModal(false);
    setBookingToCheckOut(null);
  };

  const handleCheckOutCancel = () => {
    setShowCheckOutModal(false);
    setBookingToCheckOut(null);
  };

  const handleFoodOrderClick = (booking) => {
    setBookingForFoodOrder(booking);
    setShowFoodOrderModal(true);
  };

  const handleExtendClick = (booking) => {
    setBookingToExtend(booking);
    setShowExtendModal(true);
  };

  const handleViewDetails = (booking) => {
    setBookingToViewDetails(booking);
    setShowDetailsModal(true);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setBookingToViewDetails(null);
  };

  const handleMarkNoShowClick = (booking) => {
    setBookingToMarkNoShow(booking);
    setNoShowNotes('');
    setShowNoShowModal(true);
  };

  const handleNoShowConfirm = async () => {
    if (!bookingToMarkNoShow) return;
    
    await handleMarkNoShow(bookingToMarkNoShow._id, noShowNotes);
    setShowNoShowModal(false);
    setBookingToMarkNoShow(null);
    setNoShowNotes('');
  };

  const handleNoShowCancel = () => {
    setShowNoShowModal(false);
    setBookingToMarkNoShow(null);
    setNoShowNotes('');
  };

  const resetForm = () => {
    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    setFormData({
      guest: {
        firstName: '',
        lastName: '',
        phone: '',
        idType: 'National ID',
        idNumber: '',
        nationality: '',
        isVip: false
      },
      room: '',
      checkInDate: currentDate,
      checkInTime: currentTime,
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

  const canProceedToStep2 = () => {
    return formData.guest.firstName && formData.guest.lastName && 
           formData.guest.phone && formData.guest.idNumber;
  };

  const canProceedToStep3 = () => {
    return formData.room && formData.checkInDate && formData.checkInTime;
  };

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

  const filteredBookings = useMemo(() => bookings.filter(booking => {
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
  }), [bookings, statusFilter, searchTerm]);

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

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Save preference to localStorage
    localStorage.setItem('bookingsViewMode', mode);
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
        <BookingFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          bookingStatuses={bookingStatuses}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      )}

      {/* Bookings Table */}
      {viewMode === 'table' && (
        <div className="table-container-scroll">
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
                <BookingTableRow
                  key={booking._id}
                  booking={booking}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOutClick}
                  onMarkNoShow={handleMarkNoShowClick}
                  onViewDetails={handleViewDetails}
                  onFoodOrder={handleFoodOrderClick}
                  onExtend={handleExtendClick}
                  getStatusBadge={getStatusBadge}
                  getPaymentBadge={getPaymentBadge}
                  formatDateTime={formatDateTime}
                  calculateCheckOutTime={calculateCheckOutTime}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings Cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {getPaginatedBookings().map((booking) => {
            const statusAccent =
              booking.bookingStatus === 'Confirmed' ? 'bg-amber-400' :
              booking.bookingStatus === 'Checked In' ? 'bg-green-500' :
              booking.bookingStatus === 'Checked Out' ? 'bg-gray-400' :
              booking.bookingStatus === 'Cancelled' ? 'bg-red-400' : 'bg-yellow-400';
            return (
              <div key={booking._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Thin status accent bar */}
                <div className={`h-1 w-full ${statusAccent}`} />

                <div className="p-3">
                  {/* Top row: guest name + room number */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {booking.guest?.firstName} {booking.guest?.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{booking.guest?.phone}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold text-gray-900">#{booking.room?.roomNumber}</div>
                      <div className="text-xs text-gray-500">{booking.room?.roomType?.name}</div>
                    </div>
                  </div>

                  {/* Status + payment + amount row */}
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className={`badge text-xs ${getStatusBadge(booking.bookingStatus)}`}>{booking.bookingStatus}</span>
                    <span className={`badge text-xs ${getPaymentBadge(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
                    <span className="ml-auto text-sm font-bold text-gray-900">₱{booking.totalAmount?.toLocaleString()}</span>
                  </div>

                  {/* Time info */}
                  <div className="text-xs text-gray-500 mb-1">
                    {booking.bookingStatus === 'Confirmed'
                      ? `Check-in: ${formatDateTime(booking.checkInDate)}`
                      : `${formatDateTime(booking.checkInDate)} · ${booking.duration}h`
                    }
                  </div>
                  <div className="mb-2">
                    <TimeRemaining
                      checkInDate={booking.checkInDate}
                      duration={booking.duration}
                      bookingStatus={booking.bookingStatus}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                    <button onClick={() => handleViewDetails(booking)} className="action-btn bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">Details</button>

                    {booking.bookingStatus === 'Confirmed' && (
                      <>
                        <button onClick={() => handleCheckIn(booking._id)} className="action-btn bg-green-50 text-green-700 hover:bg-green-100 border border-green-200">Check In</button>
                        <button onClick={() => handleEdit(booking)} className="action-btn bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200">Edit</button>
                        <button onClick={() => handleMarkNoShowClick(booking)} className="action-btn bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200">No Show</button>
                      </>
                    )}

                    {booking.bookingStatus === 'Checked In' && (
                      <>
                        <button onClick={() => handleCheckOutClick(booking)} className="action-btn bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">Check Out</button>
                        <button onClick={() => handleFoodOrderClick(booking)} className="action-btn bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">Food</button>
                        <button onClick={() => handleExtendClick(booking)} className="action-btn bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200">Extend</button>
                        <button onClick={() => handleEdit(booking)} className="action-btn bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200">Edit</button>
                      </>
                    )}

                    {['Confirmed', 'Checked In'].includes(booking.bookingStatus) && (
                      <button onClick={() => handleDeleteClick(booking)} className="action-btn bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6">
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

      {/* Booking Modal */}
      <BookingModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingBooking={editingBooking}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        loading={loading}
        canProceedToStep2={canProceedToStep2}
        canProceedToStep3={canProceedToStep3}
        rooms={rooms}
        roomSearchTerm={roomSearchTerm}
        setRoomSearchTerm={setRoomSearchTerm}
        roomTypeFilter={roomTypeFilter}
        setRoomTypeFilter={setRoomTypeFilter}
        durations={durations}
        bookingStatuses={bookingStatuses}
        paymentStatuses={paymentStatuses}
        paymentMethods={paymentMethods}
      />

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
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        showDetailsModal={showDetailsModal}
        handleDetailsModalClose={handleDetailsModalClose}
        bookingToViewDetails={bookings.find(b => b._id === bookingToViewDetails?._id) || bookingToViewDetails}
        getStatusBadge={getStatusBadge}
        getPaymentBadge={getPaymentBadge}
        formatDateTime={formatDateTime}
        calculateCheckOutTime={calculateCheckOutTime}
      />

      {/* Receipt Modal */}
      {showReceipt && receiptBooking && (
        <Receipt
          booking={receiptBooking}
          onClose={() => {
            setShowReceipt(false);
            setReceiptBooking(null);
          }}
          autoPrint={true}
        />
      )}

      {/* Food Order Modal */}
      {showFoodOrderModal && bookingForFoodOrder && (
        <FoodOrderModal
          isOpen={showFoodOrderModal}
          onClose={() => {
            setShowFoodOrderModal(false);
            setBookingForFoodOrder(null);
          }}
          booking={bookings.find(b => b._id === bookingForFoodOrder?._id) || bookingForFoodOrder}
          onAddFoodOrder={handleAddFoodOrder}
          onRemoveFoodOrder={handleRemoveFoodOrder}
        />
      )}

      {/* Extend Stay Modal */}
      {showExtendModal && bookingToExtend && (
        <ExtendStayModal
          isOpen={showExtendModal}
          onClose={() => {
            setShowExtendModal(false);
            setBookingToExtend(null);
          }}
          booking={bookingToExtend}
          onExtendBooking={handleExtendBooking}
        />
      )}
    </div>
  );
};

export default BookingsPage;
