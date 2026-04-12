import { useState, useEffect, useRef } from 'preact/hooks';
import apiService from '../services/api';

const POLL_INTERVAL_MS = 60 * 1000; // 1 minute
const WINDOW_MINUTES = 30;

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const dismissedIdsRef = useRef(dismissedIds);

  // Keep ref in sync so the interval closure always sees the latest dismissed set
  useEffect(() => {
    dismissedIdsRef.current = dismissedIds;
  }, [dismissedIds]);

  useEffect(() => {
    const fetchAndFilter = async () => {
      try {
        const response = await apiService.getBookings({
          bookingStatus: 'Confirmed',
          limit: 100,
        });

        const bookings = response?.data || [];
        const now = new Date();
        const windowEnd = new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000);

        const upcoming = bookings
          .filter(b => {
            if (dismissedIdsRef.current.has(b._id)) return false;
            const checkIn = new Date(b.checkInDate);
            return checkIn >= now && checkIn <= windowEnd;
          })
          .map(b => {
            const checkIn = new Date(b.checkInDate);
            const minutesUntilCheckIn = Math.round((checkIn - now) / (1000 * 60));
            return {
              id: b._id,
              guestName: `${b.guest?.firstName || ''} ${b.guest?.lastName || ''}`.trim(),
              roomNumber: b.room?.roomNumber || b.room,
              minutesUntilCheckIn,
            };
          })
          .sort((a, b) => a.minutesUntilCheckIn - b.minutesUntilCheckIn);

        setNotifications(upcoming);
      } catch {
        // Silently ignore fetch errors — notifications are non-critical
      }
    };

    fetchAndFilter();
    const interval = setInterval(fetchAndFilter, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []); // Only run once on mount

  const dismissNotification = (id) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, dismissNotification };
};

export default useNotifications;
