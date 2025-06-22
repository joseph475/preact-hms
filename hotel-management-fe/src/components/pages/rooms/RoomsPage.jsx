import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import apiService from '../../../services/api';
import { useSearch } from '../../../hooks/useSearch';
import DeleteConfirmationModal from '../../common/DeleteConfirmationModal';
import Modal from '../../common/Modal';
import Pagination from '../../common/Pagination';
import TimeRemaining from '../../common/TimeRemaining';

const RoomsPage = ({ user }) => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  const { searchTerm, updateCurrentPage } = useSearch();
  const [viewMode, setViewMode] = useState(() => {
    // Load view preference from localStorage, default to 'table'
    return localStorage.getItem('roomsViewMode') || 'cards';
  });
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'Standard',
    floor: 1,
    status: 'Available',
    description: '',
    telephone: ''
  });

  const roomStatuses = ['Available', 'Occupied', 'Maintenance', 'Out of Order'];

  useEffect(() => {
    updateCurrentPage('/rooms');
    loadRooms();
    loadRoomTypes();
  }, []);

  // Filter rooms based on search term, status, and room type
  useEffect(() => {
    let filtered = rooms;
    
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRoomTypeName(room.roomType).toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(room => room.status === statusFilter);
    }
    
    if (roomTypeFilter) {
      filtered = filtered.filter(room => getRoomTypeName(room.roomType) === roomTypeFilter);
    }
    
    setFilteredRooms(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [rooms, searchTerm, statusFilter, roomTypeFilter]);

  // Get paginated rooms
  const getPaginatedRooms = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRooms.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Save preference to localStorage
    localStorage.setItem('roomsViewMode', mode);
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRooms();
      if (response.success) {
        setRooms(response.data);
      }
    } catch (err) {
      setError('Failed to load rooms');
      console.error('Rooms error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomTypes = async () => {
    try {
      const response = await apiService.getRoomTypes();
      if (response.success) {
        setRoomTypes(response.data);
        // Set default room type if available
        if (response.data.length > 0 && !formData.roomType) {
          setFormData(prev => ({
            ...prev,
            roomType: response.data[0]._id
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load room types:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingRoom) {
        const response = await apiService.updateRoom(editingRoom._id, formData);
        if (response.success) {
          await loadRooms();
          resetForm();
          setShowModal(false);
        }
      } else {
        const response = await apiService.createRoom(formData);
        if (response.success) {
          await loadRooms();
          resetForm();
          setShowModal(false);
        }
      }
    } catch (err) {
      setError(editingRoom ? 'Failed to update room' : 'Failed to create room');
      console.error('Room operation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomType: typeof room.roomType === 'object' ? room.roomType._id : room.roomType,
      floor: room.floor || 1,
      status: room.status,
      description: room.description || '',
      telephone: room.telephone || ''
    });
    setShowModal(true);
  };

  const handleDelete = (room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    
    try {
      setLoading(true);
      const response = await apiService.deleteRoom(roomToDelete._id);
      if (response.success) {
        await loadRooms();
        setShowDeleteModal(false);
        setRoomToDelete(null);
      }
    } catch (err) {
      setError('Failed to delete room');
      console.error('Delete room error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      roomType: roomTypes.length > 0 ? roomTypes[0]._id : '',
      floor: 1,
      status: 'Available',
      description: '',
      telephone: ''
    });
    setEditingRoom(null);
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('pricing.')) {
      const pricingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          [pricingField]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };


  const getStatusBadge = (status) => {
    const statusClasses = {
      'Available': 'badge-success',
      'Occupied': 'badge-danger',
      'Maintenance': 'badge-warning',
      'Out of Order': 'badge-secondary'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const getRoomTypeName = (roomType) => {
    if (typeof roomType === 'string') {
      return roomType;
    }
    return roomType?.name || 'Unknown';
  };

  const handleBookRoom = (room) => {
    // Store the selected room data in localStorage to pass to BookingsPage
    localStorage.setItem('selectedRoomForBooking', JSON.stringify({
      id: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricing: room.roomType?.pricing || {}
    }));
    
    // Navigate to bookings page
    route('/bookings');
  };

  const handleMarkAvailable = async (room) => {
    try {
      setLoading(true);
      const response = await apiService.updateRoomStatus(room._id, 'Available');
      if (response.success) {
        await loadRooms();
      }
    } catch (err) {
      setError('Failed to update room status');
      console.error('Update room status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Occupied':
        return (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'Maintenance':
        return (
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  if (loading && rooms.length === 0) {
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
            <h1 className="page-title">
              {user?.role === 'admin' ? 'Rooms Management' : 'Rooms'}
            </h1>
            <p className="page-subtitle">
              {user?.role === 'admin' 
                ? 'Manage hotel rooms, pricing, and availability.' 
                : 'View hotel rooms and their details.'
              }
            </p>
          </div>
          {user?.role === 'admin' && (
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
              Add Room
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Filters Section */}
      {rooms.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left side - Filters */}
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
                  {roomStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Room Type Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Room Type:</label>
                <select
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {[...new Set(rooms.map(room => getRoomTypeName(room.roomType)))].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(statusFilter || roomTypeFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setRoomTypeFilter('');
                  }}
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
                {roomTypeFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Type: {roomTypeFilter}
                    <button
                      onClick={() => setRoomTypeFilter('')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Right side - View Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('table')}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Table View"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8H3m0 4h6" />
                  </svg>
                  Table
                </button>
                <button
                  onClick={() => handleViewModeChange('cards')}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                    viewMode === 'cards'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Card View"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  </svg>
                  Cards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Table View */}
      {viewMode === 'table' && (
        <div className="table-container-scroll">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Room</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Floor</th>
                <th className="table-header-cell">Capacity</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {getPaginatedRooms().map((room) => (
                <tr 
                  key={room._id} 
                  className="table-row cursor-pointer hover:bg-blue-50" 
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowDetailsModal(true);
                  }}
                >
                  {/* Room Number */}
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          room.status === 'Available' ? 'bg-green-100' :
                          room.status === 'Occupied' ? 'bg-red-100' :
                          room.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(room.status)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">Room {room.roomNumber}</div>
                        {room.description && (
                          <div className="text-xs text-gray-500 truncate max-w-32" title={room.description}>
                            {room.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Room Type */}
                  <td className="table-cell">
                    <span className="text-sm font-medium text-gray-900">{getRoomTypeName(room.roomType)}</span>
                  </td>

                  {/* Status */}
                  <td className="table-cell">
                    <div className="space-y-1">
                      <span className={`badge ${getStatusBadge(room.status)}`}>
                        <span className={`status-dot-${
                          room.status === 'Available' ? 'green' :
                          room.status === 'Occupied' ? 'red' :
                          room.status === 'Maintenance' ? 'yellow' : 'gray'
                        }`}></span>
                        {room.status}
                      </span>
                      {room.status === 'Occupied' && room.currentBooking && (
                        <div className="mt-1">
                          <TimeRemaining 
                            checkInDate={room.currentBooking.checkInDate}
                            duration={room.currentBooking.duration}
                            bookingStatus={room.currentBooking.bookingStatus}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Floor */}
                  <td className="table-cell">
                    <div className="flex items-center text-sm text-gray-900">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {room.floor}
                    </div>
                  </td>

                  {/* Capacity */}
                  <td className="table-cell">
                    <div className="flex items-center text-sm text-gray-900">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {room.roomType?.baseCapacity || 0}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      {/* Mark Available button for all users when room is in maintenance */}
                      {room.status === 'Maintenance' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAvailable(room);
                          }}
                          className="inline-flex items-center px-2 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                          title="Mark as Available"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Available
                        </button>
                      )}
                      
                      {/* Admin-only actions */}
                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(room);
                            }}
                            className="action-btn-primary"
                            title="Edit Room"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(room);
                            }}
                            className="action-btn-danger"
                            title="Delete Room"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
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
            totalItems={filteredRooms.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Rooms Cards View - Clean Minimalist Design */}
      {viewMode === 'cards' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getPaginatedRooms().map((room) => (
              <div 
                key={room._id} 
                className="bg-white rounded-xl shadow-lg border-0 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-sm"
                onClick={() => {
                  setSelectedRoom(room);
                  setShowDetailsModal(true);
                }}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                        room.status === 'Available' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' :
                        room.status === 'Occupied' ? 'bg-gradient-to-br from-red-400 to-red-500 text-white' :
                        room.status === 'Maintenance' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                        'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{room.roomNumber}</h3>
                        <p className="text-sm text-gray-600">{getRoomTypeName(room.roomType)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.status === 'Available' ? 'bg-green-100 text-green-800' :
                      room.status === 'Occupied' ? 'bg-red-100 text-red-800' :
                      room.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  
                  {/* Room Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Floor {room.floor}</span>
                    {room.status === 'Occupied' && room.currentBooking ? (
                      <div className="text-right">
                        <TimeRemaining 
                          checkInDate={room.currentBooking.checkInDate}
                          duration={room.currentBooking.duration}
                          bookingStatus={room.currentBooking.bookingStatus}
                        />
                      </div>
                    ) : room.status === 'Maintenance' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAvailable(room);
                        }}
                        className="inline-flex items-center px-2 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                        title="Mark as Available"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Available
                      </button>
                    ) : (
                      <span>{room.roomType?.baseCapacity || 0} guests</span>
                    )}
                  </div>
                </div>

                {/* Card Body - Empty for clean design */}
                {user?.role === 'user' && (
                  <div className="p-5">
                    {/* Intentionally minimal - capacity and mark available button are in header */}
                  </div>
                )}

                {/* Card Actions - Admin only */}
                {user?.role === 'admin' && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(room);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Edit Room"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(room);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete Room"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Pagination for Cards View */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredRooms.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      {filteredRooms.length === 0 && !loading && (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="empty-state-title">
            {searchTerm || statusFilter ? 'No rooms found' : 'No rooms'}
          </h3>
          <p className="empty-state-description">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search terms or filters to find the rooms you\'re looking for.' 
              : 'Get started by creating your first room to begin managing your hotel inventory.'
            }
          </p>
          {!searchTerm && !statusFilter && user?.role === 'admin' && (
            <div className="mt-6">
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
                Create First Room
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-outline"
            >
              Cancel
            </button>
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
                editingRoom ? 'Update Room' : 'Create Room'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-section">
            <h4 className="form-section-title">Basic Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select
                  className="form-select"
                  value={formData.roomType}
                  onChange={(e) => handleInputChange('roomType', e.target.value)}
                  required
                >
                  {roomTypes.length === 0 ? (
                    <option value="">Loading room types...</option>
                  ) : (
                    roomTypes.map(type => (
                      <option key={type._id} value={type._id}>{type.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 1)}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {roomStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Telephone Extension</label>
              <input
                type="text"
                className="form-input"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                placeholder="e.g., 101, 201, ext. 1001"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <h4 className="form-section-title">Description</h4>
            <div className="form-group">
              <label className="form-label">Room Description</label>
              <textarea
                className="form-textarea"
                rows="4"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional room description, special features, or notes..."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Room Details Modal */}
      <Modal
        isOpen={showDetailsModal && selectedRoom}
        onClose={() => setShowDetailsModal(false)}
        title={selectedRoom ? `Room ${selectedRoom.roomNumber} Details` : ''}
        size="large"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowDetailsModal(false)}
              className="btn-outline"
            >
              Close
            </button>
            {selectedRoom && selectedRoom.status === 'Maintenance' && (
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleMarkAvailable(selectedRoom);
                }}
                className="btn-success"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark Available
              </button>
            )}
            {selectedRoom && selectedRoom.status === 'Available' && (
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleBookRoom(selectedRoom);
                }}
                className="btn-success"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Room
              </button>
            )}
            {user?.role === 'admin' && selectedRoom && (
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEdit(selectedRoom);
                }}
                className="btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Room
              </button>
            )}
          </>
        }
      >
        {selectedRoom && (
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRoom.status === 'Available' ? 'bg-green-100' :
                      selectedRoom.status === 'Occupied' ? 'bg-red-100' :
                      selectedRoom.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {getStatusIcon(selectedRoom.status)}
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 mb-1">Room {selectedRoom.roomNumber}</h3>
                      <p className="text-sm text-gray-600">{getRoomTypeName(selectedRoom.roomType)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${getStatusBadge(selectedRoom.status)}`}>
                    <span className={`status-dot-${
                      selectedRoom.status === 'Available' ? 'green' :
                      selectedRoom.status === 'Occupied' ? 'red' :
                      selectedRoom.status === 'Maintenance' ? 'yellow' : 'gray'
                    }`}></span>
                    {selectedRoom.status}
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-base text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Floor</label>
                      <p className="text-sm text-gray-900">{selectedRoom.floor}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Capacity</label>
                      <p className="text-sm text-gray-900">{selectedRoom.roomType?.baseCapacity || 0} guests</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Telephone</label>
                      <p className="text-sm text-gray-900">{selectedRoom.telephone || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Penalty</label>
                      <p className="text-sm text-gray-900">
                        {selectedRoom.roomType?.penalty > 0 ? `₱${selectedRoom.roomType?.penalty}` : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-base text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Pricing Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">3 Hours</label>
                      <p className="text-sm text-gray-900">₱{selectedRoom.roomType?.pricing?.hourly3 || 0}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">8 Hours</label>
                      <p className="text-sm text-gray-900">₱{selectedRoom.roomType?.pricing?.hourly8 || 0}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">12 Hours</label>
                      <p className="text-sm text-gray-900">₱{selectedRoom.roomType?.pricing?.hourly12 || 0}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">24 Hours (Daily)</label>
                      <p className="text-sm text-gray-900">₱{selectedRoom.roomType?.pricing?.daily || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedRoom.description && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-base text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-sm text-gray-900 leading-relaxed">{selectedRoom.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Room"
        itemName={roomToDelete ? `Room ${roomToDelete.roomNumber}` : ''}
        itemDetails={roomToDelete ? `${getRoomTypeName(roomToDelete.roomType)} • Floor ${roomToDelete.floor} • ${roomToDelete.status}` : ''}
        warningMessage="This action cannot be undone. The room will be permanently deleted from the system along with all its associated data."
        confirmButtonText="Delete Room"
        isLoading={loading}
      />
    </div>
  );
};

export default RoomsPage;
