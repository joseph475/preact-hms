import { h } from 'preact';
import Modal from '../../../common/Modal';

const BookingDetailsModal = ({
  showDetailsModal,
  handleDetailsModalClose,
  bookingToViewDetails,
  getStatusBadge,
  getPaymentBadge,
  formatDateTime,
  calculateCheckOutTime
}) => {
  if (!bookingToViewDetails) return null;

  const isCheckedOut = bookingToViewDetails.bookingStatus === 'Checked Out';

  return (
    <Modal
      isOpen={showDetailsModal}
      onClose={handleDetailsModalClose}
      title="Booking Details"
      size="large"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-gray-900 mb-1">
                  Booking #{bookingToViewDetails.bookingNumber || bookingToViewDetails._id?.slice(-8)}
                </h3>
                <p className="text-sm text-gray-600">
                  {isCheckedOut ? 'Checkout Completed' : 'Active Booking'}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusBadge(bookingToViewDetails.bookingStatus)}`}>
                {bookingToViewDetails.bookingStatus}
              </span>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-base text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Guest Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Full Name</label>
                  <p className="text-sm text-gray-900">{bookingToViewDetails.guest?.firstName} {bookingToViewDetails.guest?.lastName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Phone Number</label>
                  <p className="text-sm text-gray-900">{bookingToViewDetails.guest?.phone}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">ID Type</label>
                  <p className="text-sm text-gray-900">{bookingToViewDetails.guest?.idType}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">ID Number</label>
                  <p className="text-sm text-gray-900">{bookingToViewDetails.guest?.idNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-base text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Room Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Room Number</label>
                  <p className="text-sm text-gray-900">#{bookingToViewDetails.room?.roomNumber}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Room Type</label>
                  <p className="text-sm text-gray-900">{typeof bookingToViewDetails.room?.roomType === 'object' ? bookingToViewDetails.room?.roomType?.name : bookingToViewDetails.room?.roomType}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Duration</label>
                  <p className="text-sm text-gray-900">{bookingToViewDetails.duration} hours</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Guest Count</label>
                  <p className="text-sm text-gray-900">{bookingToViewDetails.guestCount} guest{bookingToViewDetails.guestCount > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timing Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-base text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Timing Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Scheduled Check-in</label>
                  <p className="text-sm text-gray-900">{formatDateTime(bookingToViewDetails.checkInDate)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Actual Check-in</label>
                  <p className={`text-sm ${bookingToViewDetails.actualCheckIn ? 'text-gray-900' : 'text-gray-400'}`}>
                    {bookingToViewDetails.actualCheckIn ? formatDateTime(bookingToViewDetails.actualCheckIn) : 'Not recorded'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Scheduled Check-out</label>
                  <p className="text-sm text-gray-900">{calculateCheckOutTime(bookingToViewDetails.checkInDate, bookingToViewDetails.duration)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Actual Check-out</label>
                  <p className={`text-sm ${bookingToViewDetails.actualCheckOut ? 'text-gray-900' : 'text-gray-400'}`}>
                    {bookingToViewDetails.actualCheckOut ? formatDateTime(bookingToViewDetails.actualCheckOut) : 'Not recorded'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Duration Summary */}
            {bookingToViewDetails.actualCheckIn && bookingToViewDetails.actualCheckOut && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <label className="text-xs text-emerald-700 block mb-1">Total Stay Duration</label>
                  <p className="text-lg text-emerald-800">
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
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-base text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Payment Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Total Amount</label>
                  <p className="text-sm text-gray-900">₱{bookingToViewDetails.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Paid Amount</label>
                  <p className="text-sm text-emerald-600">₱{bookingToViewDetails.paidAmount?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Payment Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPaymentBadge(bookingToViewDetails.paymentStatus)}`}>
                    {bookingToViewDetails.paymentStatus}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Payment Method</label>
                  <p className="text-sm text-gray-900">{bookingToViewDetails.paymentMethod || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(bookingToViewDetails.specialRequests || bookingToViewDetails.notes) && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="text-base text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Additional Information
              </h4>
              <div className="space-y-3">
                {bookingToViewDetails.specialRequests && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Special Requests</label>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-sm text-gray-900 leading-relaxed">{bookingToViewDetails.specialRequests}</p>
                    </div>
                  </div>
                )}
                {bookingToViewDetails.notes && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Notes</label>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-sm text-gray-900 leading-relaxed">{bookingToViewDetails.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Booking Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-base text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Booking Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusBadge(bookingToViewDetails.bookingStatus)}`}>
                    {bookingToViewDetails.bookingStatus}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Created By</label>
                  <p className="text-sm text-gray-900">{bookingToViewDetails.createdBy?.name || 'System'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Created</label>
                  <p className="text-sm text-gray-900">{formatDateTime(bookingToViewDetails.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Updated</label>
                  <p className="text-sm text-gray-900">{formatDateTime(bookingToViewDetails.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailsModal;
