import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import useNotifications from '../../hooks/useNotifications';

const Header = ({ user, onMenuClick, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { notifications, dismissNotification } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-10 flex-shrink-0 flex h-14 bg-white border-b border-amber-200 shadow-sm">
      {/* Mobile hamburger */}
      <button
        type="button"
        className="px-4 border-r border-amber-200 text-amber-600 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1 px-4 flex items-center justify-end">
        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-lg bg-white ring-1 ring-amber-200 border border-amber-100 overflow-hidden z-50">
                <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                  <span className="font-semibold text-amber-900 text-sm">Upcoming Check-ins</span>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-amber-600 text-center">No upcoming arrivals</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="flex items-center justify-between px-4 py-3 border-b border-amber-50 last:border-0 hover:bg-amber-50">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Room {n.roomNumber}</div>
                        <div className="text-xs text-gray-600">{n.guestName}</div>
                        <div className="text-xs text-amber-600 font-medium">Check-in in {n.minutesUntilCheckIn} min</div>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="ml-2 p-1 rounded text-gray-400 hover:text-gray-600"
                        aria-label="Dismiss notification"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-xl shadow-lg bg-white ring-1 ring-amber-200 border border-amber-100 overflow-hidden">
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                  <div className="font-semibold text-amber-900 text-sm">{user?.name}</div>
                  <div className="text-amber-700 text-xs truncate">{user?.email}</div>
                  <div className="text-xs text-amber-500 capitalize mt-0.5">{user?.role}</div>
                </div>
                <a href="/profile" onClick={() => setDropdownOpen(false)}
                   className="block px-4 py-2 text-sm text-amber-800 hover:bg-amber-50 transition-colors">
                  My Profile
                </a>
                <button
                  onClick={() => { setDropdownOpen(false); onLogout(); }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-amber-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
