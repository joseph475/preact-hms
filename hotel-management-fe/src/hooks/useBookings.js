import { useState, useEffect } from 'preact/hooks';
import apiService from '../services/api';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, roomsRes, guestsRes] = await Promise.all([
        apiService.getBookings(),
        apiService.getRooms(),
        apiService.getGuests()
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (roomsRes.success) {
        // For editing purposes, we need to include all rooms, not just available ones
        // We'll filter available rooms in the room selection UI instead
        setRooms(roomsRes.data);
      }
      if (guestsRes.success) setGuests(guestsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      setLoading(true);
      // Set check-in time to current time when button is clicked
      const actualCheckInTime = new Date().toISOString();
      const response = await apiService.updateBooking(bookingId, { 
        bookingStatus: 'Checked In',
        checkInDate: actualCheckInTime
      });
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      setError('Failed to check in');
      console.error('Check in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      setLoading(true);
      const response = await apiService.updateBooking(bookingId, { 
        bookingStatus: 'Checked Out',
        paymentStatus: 'Paid',
        paidAmount: bookings.find(b => b._id === bookingId)?.totalAmount
      });
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      setError('Failed to check out');
      console.error('Check out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason === null) return; // User cancelled the prompt
    
    try {
      setLoading(true);
      const response = await apiService.cancelBooking(bookingId, reason);
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Cancel booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNoShow = async (bookingId, notes) => {
    try {
      setLoading(true);
      const response = await apiService.markNoShow(bookingId, notes);
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      setError('Failed to mark as no show');
      console.error('Mark no show error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      setLoading(true);
      const response = await apiService.deleteBooking(bookingId);
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      setError('Failed to cancel booking');
      console.error('Delete booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      const response = await apiService.createBooking(bookingData);
      if (response.success) {
        await loadData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      setError('Failed to create booking');
      console.error('Create booking error:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (bookingId, bookingData) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
