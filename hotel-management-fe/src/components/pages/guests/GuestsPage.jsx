import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import apiService from '../../../services/api';
import { useSearch } from '../../../hooks/useSearch';
import Pagination from '../../common/Pagination';
import Modal from '../../common/Modal';

const GuestsPage = ({ user }) => {
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const { searchTerm, updateCurrentPage } = useSearch();
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    updateCurrentPage('/guests');
    loadGuests();
  }, []);

  // Filter guests based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredGuests(guests);
    } else {
      const filtered = guests.filter(guest => {
        const searchLower = searchTerm.toLowerCase();
        return (
          guest.firstName?.toLowerCase().includes(searchLower) ||
          guest.lastName?.toLowerCase().includes(searchLower) ||
          guest.phone?.includes(searchTerm) ||
          guest.idNumber?.includes(searchTerm)
        );
      });
      setFilteredGuests(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [guests, searchTerm]);

  // Get paginated guests
  const getPaginatedGuests = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredGuests.slice(startIndex, endIndex);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const loadGuests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGuests();
      if (response.success) {
        setGuests(response.data);
      }
    } catch (err) {
      setError('Failed to load guests');
      console.error('Guests error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && guests.length === 0) {
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
        <h1 className="page-title">Guests Registry</h1>
        <p className="page-subtitle">
          View guests who have made bookings. Guests are automatically added when creating bookings.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Guests Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Guest Information</th>
              <th className="table-header-cell">Contact</th>
              <th className="table-header-cell">Identification</th>
              <th className="table-header-cell">Registration Date</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {getPaginatedGuests().map((guest) => (
              <tr key={guest._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="font-semibold text-gray-900">
                          {guest.firstName} {guest.lastName}
                        </div>
                        {guest.notes && (
                          <button
                            onClick={() => {
                              setSelectedGuest(guest);
                              setShowNotesModal(true);
                            }}
                            className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="View notes"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Guest ID: {guest._id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-900">{guest.phone}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{guest.idType}</div>
                    <div className="text-sm text-gray-500 font-mono">{guest.idNumber}</div>
                  </div>
                </td>
                <td className="table-cell">
                  <div>
                    <div className="text-sm text-gray-900">
                      {new Date(guest.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(guest.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredGuests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>

      {filteredGuests.length === 0 && !loading && (
        <div className="empty-state">
          <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="empty-state-title">
            {searchTerm ? 'No guests found' : 'No guests yet'}
          </h3>
          <p className="empty-state-description">
            {searchTerm 
              ? 'Try adjusting your search terms to find the guest you\'re looking for.' 
              : 'Guests will appear here automatically when they make bookings through the reservation system.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <a
                href="/bookings"
                className="btn-primary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Booking
              </a>
            </div>
          )}
        </div>
      )}

      {/* Guest Statistics */}
      {filteredGuests.length > 0 && (
        <div className="card-elevated">
          <div className="card-header">
            <h3 className="text-xl font-bold text-gray-900">Guest Statistics</h3>
            <p className="text-sm text-gray-600 mt-1">Overview of guest registration data</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{filteredGuests.length}</div>
                <div className="text-sm text-blue-700 font-medium">Total Guests</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  {filteredGuests.filter(guest => {
                    const createdDate = new Date(guest.createdAt);
                    const today = new Date();
                    return createdDate.toDateString() === today.toDateString();
                  }).length}
                </div>
                <div className="text-sm text-green-700 font-medium">New Today</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredGuests.filter(guest => {
                    const createdDate = new Date(guest.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return createdDate >= weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-purple-700 font-medium">This Week</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      <Modal
        isOpen={showNotesModal && selectedGuest}
        onClose={() => setShowNotesModal(false)}
        title={selectedGuest ? `Notes for ${selectedGuest.firstName} ${selectedGuest.lastName}` : ''}
        footer={
          <button
            type="button"
            onClick={() => setShowNotesModal(false)}
            className="btn-outline"
          >
            Close
          </button>
        }
      >
        {selectedGuest && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  {selectedGuest.firstName} {selectedGuest.lastName}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedGuest.phone} • {selectedGuest.idType}: {selectedGuest.idNumber}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Guest Notes
              </h4>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedGuest.notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GuestsPage;
