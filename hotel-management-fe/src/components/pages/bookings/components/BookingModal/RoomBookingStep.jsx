import { h } from 'preact';
import RoomSelector from './RoomSelector';
import { PROPERTY_TYPE, HOTEL_CHECKIN_EARLIEST } from '../../../../../config/environment';

const RoomBookingStep = ({
  formData,
  handleInputChange,
  rooms,
  roomSearchTerm,
  setRoomSearchTerm,
  roomTypeFilter,
  setRoomTypeFilter,
  durations,
  editingBooking
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Perfect Room</h3>
        <p className="text-gray-600 max-w-md mx-auto">Select from our available rooms and set your booking preferences</p>
      </div>

      {/* Room Selection */}
      <RoomSelector
        formData={formData}
        handleInputChange={handleInputChange}
        rooms={rooms}
        roomSearchTerm={roomSearchTerm}
        setRoomSearchTerm={setRoomSearchTerm}
        roomTypeFilter={roomTypeFilter}
        setRoomTypeFilter={setRoomTypeFilter}
        editingBooking={editingBooking}
      />

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
          <label className="form-label">
            Check-in Time *
            {PROPERTY_TYPE === 'hotel' && (
              <span className="ml-2 text-xs text-amber-600 font-normal">
                (earliest {HOTEL_CHECKIN_EARLIEST})
              </span>
            )}
          </label>
          <input
            type="time"
            className="form-input"
            value={formData.checkInTime}
            onChange={(e) => handleInputChange('checkInTime', e.target.value)}
            required
            {...(PROPERTY_TYPE === 'hotel' ? { min: HOTEL_CHECKIN_EARLIEST } : {})}
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
          {(() => {
            const selectedRoom = rooms.find(r => r._id === formData.room);
            const cap = selectedRoom?.roomType?.baseCapacity;
            if (!cap) return null;
            if (formData.guestCount > cap) {
              return (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Exceeds room capacity (max {cap} guest{cap !== 1 ? 's' : ''})
                </p>
              );
            }
            return (
              <p className="text-xs text-stone-400 mt-1">Max capacity: {cap} guest{cap !== 1 ? 's' : ''}</p>
            );
          })()}
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
  );
};

export default RoomBookingStep;
