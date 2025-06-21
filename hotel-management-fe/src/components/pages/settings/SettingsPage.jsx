import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import Pagination from '../../common/Pagination';

const SettingsPage = () => {
  const { user } = useAuth();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roomTypesCurrentPage, setRoomTypesCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Room Type Form State
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    description: '',
    baseCapacity: 1,
    pricing: {
      hourly3: 0,
      hourly8: 0,
      hourly12: 0,
      daily: 0
    },
    penalty: 0
  });
  const [editingRoomType, setEditingRoomType] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await api.getRoomTypes();
      setRoomTypes(response.data);
    } catch (err) {
      setError('Failed to fetch room types');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      if (editingRoomType) {
        await api.updateRoomType(editingRoomType._id, roomTypeForm);
        setSuccess('Room type updated successfully');
      } else {
        await api.createRoomType(roomTypeForm);
        setSuccess('Room type created successfully');
      }
      
      setRoomTypeForm({ 
        name: '', 
        description: '', 
        baseCapacity: 1,
        pricing: {
          hourly3: 0,
          hourly8: 0,
          hourly12: 0,
          daily: 0
        },
        penalty: 0
      });
      setEditingRoomType(null);
      fetchRoomTypes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room type');
    } finally {
      setLoading(false);
    }
  };

  const editRoomType = (roomType) => {
    setRoomTypeForm({
      name: roomType.name,
      description: roomType.description || '',
      baseCapacity: roomType.baseCapacity,
      pricing: roomType.pricing || {
        hourly3: 0,
        hourly8: 0,
        hourly12: 0,
        daily: 0
      },
      penalty: roomType.penalty || 0
    });
    setEditingRoomType(roomType);
  };

  const deleteRoomType = async (id) => {
    if (confirm('Are you sure you want to delete this room type?')) {
      try {
        await api.deleteRoomType(id);
        setSuccess('Room type deleted successfully');
        fetchRoomTypes();
      } catch (err) {
        setError('Failed to delete room type');
      }
    }
  };

  const cancelEdit = () => {
    setRoomTypeForm({ 
      name: '', 
      description: '', 
      baseCapacity: 1,
      pricing: {
        hourly3: 0,
        hourly8: 0,
        hourly12: 0,
        daily: 0
      },
      penalty: 0
    });
    setEditingRoomType(null);
  };

  const handlePricingChange = (field, value) => {
    setRoomTypeForm(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: parseFloat(value) || 0
      }
    }));
  };

  // Pagination functions
  const getPaginatedRoomTypes = () => {
    const startIndex = (roomTypesCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return roomTypes.slice(startIndex, endIndex);
  };

  const handleRoomTypesPageChange = (page) => {
    setRoomTypesCurrentPage(page);
  };

  if (user && user.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage room types</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Room Types Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Type Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingRoomType ? 'Edit Room Type' : 'Add Room Type'}
          </h2>
          <form onSubmit={handleRoomTypeSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={roomTypeForm.name}
                onChange={(e) => setRoomTypeForm({ ...roomTypeForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={roomTypeForm.description}
                onChange={(e) => setRoomTypeForm({ ...roomTypeForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Capacity
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={roomTypeForm.baseCapacity}
                onChange={(e) => setRoomTypeForm({ ...roomTypeForm, baseCapacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Pricing Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing (₱)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">3 Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roomTypeForm.pricing.hourly3}
                    onChange={(e) => handlePricingChange('hourly3', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">8 Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roomTypeForm.pricing.hourly8}
                    onChange={(e) => handlePricingChange('hourly8', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">12 Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roomTypeForm.pricing.hourly12}
                    onChange={(e) => handlePricingChange('hourly12', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">24 Hours (Daily)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={roomTypeForm.pricing.daily}
                    onChange={(e) => handlePricingChange('daily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Penalty */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penalty (₱)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={roomTypeForm.penalty}
                onChange={(e) => setRoomTypeForm({ ...roomTypeForm, penalty: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingRoomType ? 'Update' : 'Create'}
              </button>
              {editingRoomType && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Room Types List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Room Types</h2>
          <div className="space-y-3">
            {getPaginatedRoomTypes().map((roomType) => (
              <div key={roomType._id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">{roomType.name}</h3>
                  <p className="text-sm text-gray-600">Capacity: {roomType.baseCapacity}</p>
                  {roomType.pricing && (
                    <p className="text-sm text-gray-600">
                      Pricing: ₱{roomType.pricing.hourly3}/3h - ₱{roomType.pricing.daily}/24h
                    </p>
                  )}
                  {roomType.penalty > 0 && (
                    <p className="text-sm text-gray-600">Penalty: ₱{roomType.penalty}</p>
                  )}
                  {roomType.description && (
                    <p className="text-sm text-gray-500">{roomType.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => editRoomType(roomType)}
                    className="action-btn-primary"
                    title="Edit Room Type"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteRoomType(roomType._id)}
                    className="action-btn-danger"
                    title="Delete Room Type"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination for Room Types */}
          <Pagination
            currentPage={roomTypesCurrentPage}
            totalItems={roomTypes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handleRoomTypesPageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
