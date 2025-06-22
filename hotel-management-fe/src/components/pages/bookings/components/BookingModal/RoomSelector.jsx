import { h } from 'preact';

const RoomSelector = ({
  formData,
  handleInputChange,
  rooms,
  roomSearchTerm,
  setRoomSearchTerm,
  roomTypeFilter,
  setRoomTypeFilter,
  editingBooking
}) => {
  // Get unique room types for filtering
  const roomTypes = [...new Set(rooms.map(room => 
    typeof room.roomType === 'object' ? room.roomType?.name : room.roomType
  ).filter(Boolean))];

  return (
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
  );
};

export default RoomSelector;
