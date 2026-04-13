import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';
import Pagination from '../../common/Pagination';
import Modal from '../../common/Modal';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      setIsModalOpen(false);
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
    setError('');
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
    setIsModalOpen(true);
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
    setIsModalOpen(false);
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
      {/* Page header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Settings</h1>
          <p className="text-primary-800 opacity-70">Manage room types</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError('');
            cancelEdit();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 btn-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          Add Room Type
        </button>
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

      {/* Appearance */}
      <div className="bg-white p-6 rounded-lg shadow w-full mb-6">
        <h2 className="text-lg font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-gray-500 mb-4">Choose your interface color theme</p>
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setTheme('amber')}
            className="flex flex-col items-center gap-2 focus:outline-none group"
          >
            <div
              className={`w-10 h-10 rounded-full transition-all duration-200 ${
                theme === 'amber'
                  ? 'ring-2 ring-offset-2 ring-amber-500'
                  : 'opacity-60 group-hover:opacity-90'
              }`}
              style={{ background: 'linear-gradient(135deg, #7c2d12 50%, #f59e0b 50%)' }}
            />
            <span className={`text-xs font-medium ${theme === 'amber' ? 'text-amber-700' : 'text-gray-500'}`}>
              Warm Amber
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('blue')}
            className="flex flex-col items-center gap-2 focus:outline-none group"
          >
            <div
              className={`w-10 h-10 rounded-full transition-all duration-200 ${
                theme === 'blue'
                  ? 'ring-2 ring-offset-2 ring-blue-500'
                  : 'opacity-60 group-hover:opacity-90'
              }`}
              style={{ background: 'linear-gradient(135deg, #1e3a8a 50%, #3b82f6 50%)' }}
            />
            <span className={`text-xs font-medium ${theme === 'blue' ? 'text-blue-700' : 'text-gray-500'}`}>
              Light Blue
            </span>
          </button>
        </div>
      </div>

      {/* Room Types List */}
      <div className="bg-white p-6 rounded-lg shadow w-full">
        <h2 className="text-lg font-semibold mb-4">Room Types</h2>
        <div className="space-y-3">
          {getPaginatedRoomTypes().map((roomType) => (
            <div key={roomType._id} className="p-3 border rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{roomType.name}</h3>
                  <p className="text-sm text-gray-600">Capacity: {roomType.baseCapacity}</p>
                  {roomType.penalty > 0 && (
                    <p className="text-sm text-gray-600">Penalty: ₱{roomType.penalty}</p>
                  )}
                  {roomType.description && (
                    <p className="text-sm text-gray-500">{roomType.description}</p>
                  )}
                  {roomType.pricing && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                      <div className="bg-amber-50 rounded p-2 text-center">
                        <p className="text-primary-800 opacity-70 mb-0.5">3 hrs</p>
                        <p className="font-bold text-primary-900">₱{roomType.pricing.hourly3}</p>
                      </div>
                      <div className="bg-amber-50 rounded p-2 text-center">
                        <p className="text-primary-800 opacity-70 mb-0.5">8 hrs</p>
                        <p className="font-bold text-primary-900">₱{roomType.pricing.hourly8}</p>
                      </div>
                      <div className="bg-amber-50 rounded p-2 text-center">
                        <p className="text-primary-800 opacity-70 mb-0.5">12 hrs</p>
                        <p className="font-bold text-primary-900">₱{roomType.pricing.hourly12}</p>
                      </div>
                      <div className="bg-amber-50 rounded p-2 text-center">
                        <p className="text-primary-800 opacity-70 mb-0.5">24 hrs</p>
                        <p className="font-bold text-primary-900">₱{roomType.pricing.daily}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-3 flex-shrink-0">
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
            </div>
          ))}
        </div>

        <Pagination
          currentPage={roomTypesCurrentPage}
          totalItems={roomTypes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handleRoomTypesPageChange}
        />
      </div>

      {/* Add / Edit Room Type Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={cancelEdit}
        title=""
        showCloseButton={false}
        size="default"
      >
        {/* Modal header — matches modal-header style (bg-amber-50) */}
        <div className="-mx-6 -mt-4 bg-amber-50 border-b border-amber-100 px-6 py-5 rounded-t-2xl">
          <div className="flex justify-end mb-1">
            <button
              type="button"
              onClick={cancelEdit}
              className="text-amber-400 hover:text-amber-600 transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">
            Room Type
          </div>
          <div className="text-2xl font-extrabold text-amber-900">
            {editingRoomType ? `Edit ${editingRoomType.name}` : 'Add Room Type'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRoomTypeSubmit} className="mt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={roomTypeForm.name}
              onChange={(e) => setRoomTypeForm({ ...roomTypeForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={roomTypeForm.description}
              onChange={(e) => setRoomTypeForm({ ...roomTypeForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Capacity</label>
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing (₱)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-primary-800 mb-1">3 Hours (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomTypeForm.pricing.hourly3}
                  onChange={(e) => handlePricingChange('hourly3', e.target.value)}
                  className="form-input text-sm w-full"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary-800 mb-1">8 Hours (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomTypeForm.pricing.hourly8}
                  onChange={(e) => handlePricingChange('hourly8', e.target.value)}
                  className="form-input text-sm w-full"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary-800 mb-1">12 Hours (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomTypeForm.pricing.hourly12}
                  onChange={(e) => handlePricingChange('hourly12', e.target.value)}
                  className="form-input text-sm w-full"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary-800 mb-1">24 Hours (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={roomTypeForm.pricing.daily}
                  onChange={(e) => handlePricingChange('daily', e.target.value)}
                  className="form-input text-sm w-full"
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Penalty (₱)</label>
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

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingRoomType ? 'Update Room Type' : 'Create Room Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
