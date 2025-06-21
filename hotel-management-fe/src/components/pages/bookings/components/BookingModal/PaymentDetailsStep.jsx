import { h } from 'preact';

const PaymentDetailsStep = ({
  formData,
  handleInputChange,
  bookingStatuses,
  paymentStatuses,
  paymentMethods,
  durations,
  rooms,
  editingBooking
}) => {
  return (
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
  );
};

export default PaymentDetailsStep;
