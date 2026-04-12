import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const Sidebar = ({ user, isOpen, onClose }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const handleRouteChange = () => setCurrentPath(window.location.pathname);

    window.addEventListener('popstate', handleRouteChange);
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function(...args) { origPush.apply(history, args); handleRouteChange(); };
    history.replaceState = function(...args) { origReplace.apply(history, args); handleRouteChange(); };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  const getNavItems = () => {
    const items = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        name: 'Rooms',
        href: '/rooms',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        name: 'Bookings',
        href: '/bookings',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        name: 'Guests',
        href: '/guests',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        name: 'Food Menu',
        href: '/food-menu',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ];

    if (user?.role === 'admin') {
      items.push(
        {
          name: 'Users',
          href: '/users',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ),
        },
        {
          name: 'Settings',
          href: '/settings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        }
      );
    }

    return items;
  };

  const navItems = getNavItems();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-48 flex-col py-4 px-3 gap-1"
           style={{ backgroundColor: '#7c2d12' }}>
        {/* Logo */}
        <a href="/dashboard" className="flex items-center gap-2 px-2 py-2 mb-3 flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 bg-amber-300 rounded-lg flex-shrink-0">
            <svg className="w-4 h-4 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-amber-200 font-bold text-sm">Hotel MS</span>
        </a>

        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = currentPath === item.href || (item.href === '/dashboard' && currentPath === '/');
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-amber-300 text-amber-900'
                  : 'text-amber-200 opacity-70 hover:opacity-100 hover:bg-amber-800'
              }`}
            >
              {item.icon}
              {item.name}
            </a>
          );
        })}

        {/* Avatar at bottom */}
        <div className="mt-auto">
          <a
            href="/profile"
            className="flex items-center gap-2 px-2 py-2 rounded-xl text-amber-200 hover:bg-amber-800 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-300 text-amber-900 text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-amber-100 truncate">{user?.name}</div>
              <div className="text-xs text-amber-400 capitalize">{user?.role}</div>
            </div>
          </a>
        </div>
      </div>

      {/* Mobile sidebar (full-width overlay) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col py-4 px-3 transform lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
        style={{ backgroundColor: '#7c2d12' }}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-amber-300 font-bold text-lg">Hotel MS</span>
          <button onClick={onClose} className="text-amber-200 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || (item.href === '/dashboard' && currentPath === '/');
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-300 text-amber-900'
                    : 'text-amber-200 opacity-70 hover:opacity-100 hover:bg-amber-800'
                }`}
              >
                {item.icon}
                {item.name}
              </a>
            );
          })}
        </nav>

        <a
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 mt-4 rounded-xl text-amber-200 hover:bg-amber-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center text-amber-900 text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-100">{user?.name}</div>
            <div className="text-xs text-amber-300 capitalize">{user?.role}</div>
          </div>
        </a>
      </div>
    </>
  );
};

export default Sidebar;
