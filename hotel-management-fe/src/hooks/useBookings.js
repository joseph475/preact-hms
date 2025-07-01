import { useState } from 'preact/hooks';
import apiService from '../services/api';
import { useSimpleCache } from './useSimpleCache';
import cacheService from '../services/cacheService';

export const useBookings = () => {
  const [error, setError] = useState('');

  // Use individual cache hooks for each data type
  const {
    data: bookingsResponse,
    loading: bookingsLoading,
    refresh: refreshBookings
  } = useSimpleCache('/bookings', () => apiService.getBookings());

  const {
    data: roomsResponse,
    loading: roomsLoading,
    refresh: refreshRooms
  } = useSimpleCache('/rooms', () => apiService.getRooms());

  const {
    data: guestsResponse,
    loading: guestsLoading,
    refresh: refreshGuests
  } = useSimpleCache('/guests', () => apiService.getGuests());

  // Extract data from responses
  const bookings = bookingsResponse?.data || [];
  const rooms = roomsResponse?.data || [];
  const guests = guestsResponse?.data || [];

  // Overall loading state
  const loading = bookingsLoading || roomsLoading || guestsLoading;

  const loadData = async () => {
    try {
      setError('');
      await Promise.all([
        refreshBookings(),
        refreshRooms(),
        refreshGuests()
      ]);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      // Set check-in time to current time when button is clicked
      const actualCheckInTime = new Date().toISOString();
      const response = await apiService.updateBooking(bookingId, { 
        bookingStatus: 'Checked In',
        checkInDate: actualCheckInTime
      });
      if (response.success) {
        // Invalidate global cache for rooms to ensure all components get fresh data
        cacheService.invalidate('rooms');
        
        // Refresh all data including rooms to update room status
        await Promise.all([
          refreshBookings(),
          refreshRooms(),
          refreshGuests()
        ]);
      }
    } catch (err) {
      setError('Failed to check in');
      console.error('Check in error:', err);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      const response = await apiService.updateBooking(bookingId, { 
        bookingStatus: 'Checked Out',
        paymentStatus: 'Paid',
        paidAmount: bookings.find(b => b._id === bookingId)?.totalAmount
      });
      if (response.success) {
        // Invalidate global cache for rooms to ensure all components get fresh data
        cacheService.invalidate('rooms');
        
        // Refresh all data including rooms to update room status
        await Promise.all([
          refreshBookings(),
          refreshRooms(),
          refreshGuests()
        ]);
      }
    } catch (err) {
      setError('Failed to check out');
      console.error('Check out error:', err);
    }
  };

  const handleCancel = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason === null) return; // User cancelled the prompt
    
    try {
      const response = await apiService.cancelBooking(bookingId, reason);
      if (response.success) {
        // Invalidate global cache for rooms since cancellation makes room available
        cacheService.invalidate('rooms');
        await loadData();
      }
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Cancel booking error:', err);
    }
  };

  const handleMarkNoShow = async (bookingId, notes) => {
    try {
      const response = await apiService.markNoShow(bookingId, notes);
      if (response.success) {
        // Invalidate global cache for rooms since no-show makes room available
        cacheService.invalidate('rooms');
        await loadData();
      }
    } catch (err) {
      setError('Failed to mark as no show');
      console.error('Mark no show error:', err);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      const response = await apiService.deleteBooking(bookingId);
      if (response.success) {
        // Invalidate global cache for rooms since deletion makes room available
        cacheService.invalidate('rooms');
        await loadData();
      }
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Delete booking error:', err);
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const response = await apiService.createBooking(bookingData);
      if (response.success) {
        // Invalidate global cache for rooms since new booking makes room occupied
        cacheService.invalidate('rooms');
        await loadData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      setError('Failed to create booking');
      console.error('Create booking error:', err);
      return { success: false };
    }
  };

  const updateBooking = async (bookingId, bookingData) => {
    try {
      const response = await apiService.updateBooking(bookingId, bookingData);
      if (response.success) {
        await loadData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      setError('Failed to update booking');
      console.error('Update booking error:', err);
      return { success: false };
    }
  };


  return {
    bookings,
    rooms,
    guests,
    loading,
    error,
    setError,
    loadData,
    handleCheckIn,
    handleCheckOut,
    handleCancel,
    handleMarkNoShow,
    handleDelete,
    createBooking,
    updateBooking
  };
};
