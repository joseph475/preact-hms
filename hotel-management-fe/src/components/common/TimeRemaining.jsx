import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const TimeRemaining = ({ checkInDate, duration, bookingStatus }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Only set up timer if booking is checked in
    if (bookingStatus !== 'Checked In') {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, [bookingStatus]);

  // Only show for checked-in bookings
  if (bookingStatus !== 'Checked In') {
    return null;
  }

  const getRemainingTime = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkIn.getTime() + (duration * 60 * 60 * 1000));
    const now = currentTime;
    const remainingMs = checkOut.getTime() - now.getTime();
    
    if (remainingMs <= 0) {
      return { minutes: 0, isOverdue: true };
    }
    
    const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
    return { 
      minutes: remainingMinutes, 
      isOverdue: false,
      isNearExpiry: remainingMinutes <= 20 && remainingMinutes > 0
    };
  };

  const formatRemainingTime = (minutes) => {
    if (minutes <= 0) return 'Overdue';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m left`;
    }
    return `${mins}m left`;
  };

  const timeInfo = getRemainingTime();

  if (timeInfo.isOverdue) {
    return (
      <div className="flex items-center mt-1">
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Overdue
        </div>
      </div>
    );
  } else if (timeInfo.isNearExpiry) {
    return (
      <div className="flex items-center mt-1">
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {formatRemainingTime(timeInfo.minutes)}
        </div>
      </div>
    );
  } else if (timeInfo.minutes > 0) {
    return (
      <div className="flex items-center mt-1">
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatRemainingTime(timeInfo.minutes)}
        </div>
      </div>
    );
  }

  return null;
};

export default TimeRemaining;
