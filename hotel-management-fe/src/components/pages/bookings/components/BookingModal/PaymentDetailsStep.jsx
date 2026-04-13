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
  const isPartial = formData.paymentStatus === 'Partial';
  const isBankTransfer = formData.paymentMethod === 'Bank Transfer';
  const totalAmount = parseFloat(formData.totalAmount) || 0;
  const paidAmount = parseFloat(formData.paidAmount) || 0;
  const balance = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment & Additional Details</h3>
        <p className="text-sm text-gray-600">Set payment information and any special requests</p>
      </div>

      {/* Booking Status + Payment Status + Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group">
          <label className="form-label">Booking Status</label>
          <select
            className="form-select"
            value={formData.bookingStatus}
            onChange={(e) => handleInputChange('bookingStatus', e.target.value)}
          >
            {editingBooking ? (
              bookingStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))
            ) : (
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
            onChange={(e) => {
              handleInputChange('paymentStatus', e.target.value);
              // Clear partial amount when switching away from Partial
              if (e.target.value !== 'Partial') {
                handleInputChange('paidAmount', 0);
              }
            }}
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
            onChange={(e) => {
              handleInputChange('paymentMethod', e.target.value);
              if (e.target.value !== 'Bank Transfer') {
                handleInputChange('bankReference', '');
              }
            }}
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Partial payment amount — shown when Payment Status = Partial */}
      {isPartial && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Partial Payment Details</p>
          <div className="form-group mb-0">
            <label className="form-label">
              Amount Paid Now
              <span className="ml-2 text-xs font-normal text-stone-400">
                (out of ₱{totalAmount.toLocaleString()})
              </span>
            </label>
            <input
              type="number"
              className="form-input"
              min="0"
              max={totalAmount}
              step="1"
              placeholder="0"
              value={formData.paidAmount || ''}
              onChange={(e) => handleInputChange('paidAmount', e.target.value)}
            />
          </div>
          {paidAmount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-amber-700 font-medium">Balance remaining</span>
              <span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₱{Math.max(0, balance).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bank reference — shown when Payment Method = Bank Transfer */}
      {isBankTransfer && (
        <div className="form-group">
          <label className="form-label">Bank Reference / Account Details</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. BDO Ref #12345678"
            value={formData.bankReference || ''}
            onChange={(e) => handleInputChange('bankReference', e.target.value)}
          />
        </div>
      )}

      {/* Special Requests */}
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
          <div className="flex justify-between font-semibold border-t border-gray-200 pt-2 mt-2">
            <span>Total Amount:</span>
            <span>₱{totalAmount.toLocaleString()}</span>
          </div>
          {isPartial && paidAmount > 0 && (
            <>
              <div className="flex justify-between text-emerald-700">
                <span>Paid Now:</span>
                <span>₱{paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600 font-medium">
                <span>Balance Due:</span>
                <span>₱{Math.max(0, balance).toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsStep;
