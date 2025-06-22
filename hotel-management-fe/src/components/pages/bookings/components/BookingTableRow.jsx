import { h, Fragment } from 'preact';
import TimeRemaining from '../../../common/TimeRemaining';

const BookingTableRow = ({ 
  booking, 
  onEdit, 
  onDelete, 
  onCheckIn, 
  onCheckOut, 
  onMarkNoShow, 
  onViewDetails,
  getStatusBadge,
  getPaymentBadge,
  formatDateTime,
  calculateCheckOutTime
}) => {
  return (
    <tr className="table-row">
      <td className="table-cell">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-900">
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
          <div className="text-sm text-gray-900">
            Room {booking.room?.roomNumber}
          </div>
          <div className="text-sm text-gray-500">
            {typeof booking.room?.roomType === 'object' ? booking.room?.roomType?.name : booking.room?.roomType}
          </div>
        </div>
      </td>
      <td className="table-cell">
        <div>
          <div className="text-sm text-gray-900">
            {formatDateTime(booking.checkInDate)}
          </div>
          <div className="text-sm text-gray-500">
            Duration: {booking.duration}h
          </div>
          <div className="text-sm text-gray-500">
            Out: {calculateCheckOutTime(booking.checkInDate, booking.duration)}
          </div>
        </div>
      </td>
      <td className="table-cell">
        <span className="text-sm text-gray-900">
          ₱{booking.totalAmount?.toLocaleString()}
        </span>
      </td>
      <td className="table-cell">
        <div>
          <span className={`badge ${getStatusBadge(booking.bookingStatus)}`}>
            <span className={`status-dot-${
              booking.bookingStatus === 'Confirmed' ? 'blue' :
              booking.bookingStatus === 'Checked In' ? 'green' :
              booking.bookingStatus === 'Checked Out' ? 'gray' :
              booking.bookingStatus === 'Cancelled' ? 'red' : 'yellow'
            }`}></span>
            {booking.bookingStatus}
          </span>
          <div className="mt-1">
            <TimeRemaining 
              checkInDate={booking.checkInDate}
              duration={booking.duration}
              bookingStatus={booking.bookingStatus}
            />
          </div>
        </div>
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
                onClick={() => onCheckIn(booking._id)}
                className="action-btn-success"
                title="Check In Guest"
              >
                Check In
              </button>
              <button
                onClick={() => onMarkNoShow(booking)}
                className="action-btn-warning"
                title="Mark as No Show"
              >
                No Show
              </button>
            </>
          )}
          {booking.bookingStatus === 'Checked In' && (
            <button
              onClick={() => onCheckOut(booking)}
              className="action-btn-primary"
              title="Check Out Guest"
            >
              Check Out
            </button>
          )}
          {booking.bookingStatus === 'Checked Out' && (
            <button
              onClick={() => onViewDetails(booking)}
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
              onClick={() => onEdit(booking)}
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
              onClick={() => onDelete(booking)}
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
  );
};

export default BookingTableRow;
