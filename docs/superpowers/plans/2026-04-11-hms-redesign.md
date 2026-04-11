# HMS Major Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic blue Tailwind theme with a warm boutique-hotel aesthetic (amber/cream palette, Plus Jakarta Sans, icon-only sidebar) and add per-page layout improvements including guest search.

**Architecture:** Global CSS overhaul in `index.css` + `tailwind.config.js` propagates amber palette to every page automatically. Sidebar is rewritten from 256px labeled to 64px icon-only. Each page then gets targeted structural improvements (no shared state changes needed between pages).

**Tech Stack:** Preact 10, Tailwind CSS 3.3, Webpack 5, preact-router. All imports use `preact` / `preact/hooks`. No test framework — verification is visual via `npm run dev` in `hotel-management-fe/`.

---

## File Map

| File | Task | Change |
|---|---|---|
| `src/index.html` | 1 | Replace Inter with Plus Jakarta Sans |
| `tailwind.config.js` | 1 | Amber primary palette, PJS font |
| `src/styles/index.css` | 2 | Full palette + component class rewrite |
| `src/components/layout/Sidebar.jsx` | 3 | Icon-only w-16 sidebar |
| `src/components/App.jsx` | 4 | ml-64 → ml-16 main margin |
| `src/components/layout/Header.jsx` | 4 | Amber colors, layout polish |
| `src/components/pages/dashboard/DashboardPage.jsx` | 5 | Room status grid with type+status chips |
| `src/components/pages/rooms/RoomsPage.jsx` | 6 | Card redesign (no rates), table col hiding |
| `src/components/pages/bookings/BookingsPage.jsx` | 7 | Step indicator, card redesign, filter pills |
| `src/components/pages/guests/GuestsPage.jsx` | 8 | Inline search bar + local filtering |
| `src/components/pages/food-menu/FoodMenuPage.jsx` | 9 | Pill tabs with counts, toggle-style availability |
| `src/components/pages/reports/ReportsPage.jsx` | 10 | Revenue + Occupancy tabs implemented |
| `src/components/pages/users/UsersPage.jsx` | 11 | Stacked name/email, filter pills |
| `src/components/pages/settings/SettingsPage.jsx` | 12 | Stacked layout, pricing grid |
| `src/components/pages/profile/ProfilePage.jsx` | 13 | Full implementation with edit form |

---

## Task 1: Foundation — Font + Tailwind Config

**Files:**
- Modify: `hotel-management-fe/src/index.html`
- Modify: `hotel-management-fe/tailwind.config.js`

- [ ] **Step 1: Replace font in index.html**

Replace the Inter font link with Plus Jakarta Sans:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hotel Management System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

- [ ] **Step 2: Replace Tailwind config with amber palette**

Full replacement of `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef9f0',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        sidebar: '#7c2d12',
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif:   ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundColor: {
        app: '#fdf8f3',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Start dev server and verify font loads**

```bash
cd hotel-management-fe && npm run dev
```

Open http://localhost:3002. Open DevTools → Network → filter "jakarta" — the font file should load. Text should render in Plus Jakarta Sans. Expected: font change visible, no console errors.

- [ ] **Step 4: Commit**

```bash
cd hotel-management-fe
git add src/index.html tailwind.config.js
git commit -m "feat: replace font with Plus Jakarta Sans, swap Tailwind palette to amber"
```

---

## Task 2: Global CSS Overhaul (`index.css`)

**Files:**
- Modify: `hotel-management-fe/src/styles/index.css`

This is the biggest change. Replace the entire file content. Every page uses these classes so this one edit propagates the warm theme everywhere.

- [ ] **Step 1: Replace index.css completely**

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }

  body {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    font-weight: 400;
    line-height: 1.5;
    color: #78350f;
    background-color: #fdf8f3;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    font-weight: 700;
    line-height: 1.2;
  }

  .page-title, .modal-title, .form-section-title {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    font-weight: 700;
  }
}

@layer components {
  /* Page Layout */
  .page-container { @apply space-y-4; }
  .page-header { @apply mb-4 pb-3 border-b border-amber-200; }
  .page-title { @apply text-2xl font-bold text-amber-900 mb-1; }
  .page-subtitle { @apply text-base text-amber-800 leading-normal; }
  .section-spacing { @apply mb-4; }
  .content-section { @apply mb-4; }

  /* Buttons */
  .btn {
    @apply inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:shadow-md;
  }
  .btn-primary {
    @apply btn bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 hover:-translate-y-0.5;
  }
  .btn-secondary {
    @apply btn bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 focus:ring-amber-400 hover:-translate-y-0.5;
  }
  .btn-success {
    @apply btn bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 hover:-translate-y-0.5;
  }
  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:-translate-y-0.5;
  }
  .btn-warning {
    @apply btn bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 hover:-translate-y-0.5;
  }
  .btn-outline {
    @apply btn bg-white border-amber-200 text-amber-800 hover:bg-amber-50 focus:ring-amber-400 hover:border-amber-300;
  }

  /* Forms */
  .form-group { @apply mb-3; }
  .form-row { @apply grid grid-cols-1 gap-3 sm:grid-cols-2; }
  .form-row-3 { @apply grid grid-cols-1 gap-3 sm:grid-cols-3; }
  .form-label { @apply block text-sm font-semibold text-amber-800 mb-1; }
  .form-input {
    @apply block w-full px-3 py-2 border border-amber-200 rounded-lg shadow-sm text-amber-900 placeholder-amber-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 sm:text-sm transition-colors duration-200;
  }
  .form-select {
    @apply block w-full px-3 py-2 border border-amber-200 rounded-lg shadow-sm text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 sm:text-sm transition-colors duration-200;
  }
  .form-textarea {
    @apply block w-full px-3 py-2 border border-amber-200 rounded-lg shadow-sm text-amber-900 placeholder-amber-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 sm:text-sm resize-none transition-colors duration-200;
  }

  /* Cards */
  .card {
    @apply bg-white rounded-xl border border-amber-200 shadow-sm;
  }
  .card-elevated {
    @apply bg-white rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-shadow duration-200;
  }
  .card-header {
    @apply px-6 py-4 border-b border-amber-100 bg-amber-50 rounded-t-xl;
  }
  .card-body { @apply px-6 py-4; }
  .card-footer {
    @apply px-6 py-4 border-t border-amber-100 bg-amber-50 rounded-b-xl;
  }
  .stats-card {
    @apply bg-white rounded-xl border border-amber-200 shadow-sm p-5;
  }

  /* Tables */
  .table-container {
    @apply bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden;
  }
  .table { @apply min-w-full divide-y divide-amber-100; }
  .table-header { @apply bg-amber-100; }
  .table-header-cell {
    @apply px-4 py-3 text-left text-xs font-bold text-amber-800 uppercase tracking-wider;
  }
  .table-body { @apply bg-white divide-y divide-amber-50; }
  .table-row { @apply hover:bg-amber-50 transition-colors duration-150; }
  .table-cell { @apply px-4 py-3 text-sm text-amber-900; }

  /* Badges */
  .badge-success { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200; }
  .badge-warning { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200; }
  .badge-danger  { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200; }
  .badge-info    { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200; }
  .badge-primary { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200; }
  .badge-secondary { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200; }

  /* Sidebar nav (kept for mobile full-width overlay) */
  .sidebar-nav { @apply space-y-1; }
  .sidebar-nav-item {
    @apply flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200;
  }
  .sidebar-nav-item-active {
    @apply sidebar-nav-item bg-amber-200 text-amber-900;
  }
  .sidebar-nav-item-inactive {
    @apply sidebar-nav-item text-amber-100 hover:bg-amber-800 hover:text-white;
  }

  /* Modals */
  .modal-overlay {
    @apply fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm;
  }
  .modal-container {
    @apply relative bg-white rounded-2xl shadow-2xl w-full border border-amber-200 max-w-lg lg:max-w-2xl;
  }
  .modal-header {
    @apply flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50 rounded-t-2xl;
  }
  .modal-title { @apply text-lg font-bold text-amber-900; }
  .modal-body { @apply px-6 py-4; }
  .modal-footer {
    @apply flex items-center justify-end gap-3 px-6 py-4 border-t border-amber-100 bg-amber-50 rounded-b-2xl;
  }

  /* Alerts */
  .alert-success {
    @apply p-4 mb-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg text-green-800 text-sm;
  }
  .alert-error {
    @apply p-4 mb-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-red-800 text-sm;
  }
  .alert-warning {
    @apply p-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg text-yellow-800 text-sm;
  }
  .alert-info {
    @apply p-4 mb-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg text-amber-800 text-sm;
  }

  /* Empty states */
  .empty-state { @apply text-center py-12; }
  .empty-state-icon { @apply mx-auto h-12 w-12 text-amber-300 mb-4; }
  .empty-state-title { @apply text-lg font-bold text-amber-900 mb-2; }
  .empty-state-description { @apply text-sm text-amber-700 max-w-sm mx-auto; }

  /* Spinner */
  .spinner {
    @apply animate-spin rounded-full h-10 w-10 border-4 border-amber-200 border-t-amber-600;
  }

  /* Scrollbar */
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #fef9f0; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #fde68a; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d97706; }

  /* Status dots */
  .status-dot { @apply inline-block w-2 h-2 rounded-full mr-1.5; }
  .status-dot-green  { @apply status-dot bg-green-500; }
  .status-dot-yellow { @apply status-dot bg-yellow-500; }
  .status-dot-red    { @apply status-dot bg-red-500; }
  .status-dot-amber  { @apply status-dot bg-amber-500; }
  .status-dot-gray   { @apply status-dot bg-gray-400; }

  /* Responsive text */
  .responsive-text { @apply text-sm sm:text-base; }

  /* Focus ring utility */
  .focus-ring { @apply focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2; }

  /* Print */
  @media print {
    .no-print { display: none !important; }
    .print-break { page-break-after: always; }
  }

  /* Booking cards (used by BookingsPage) */
  .booking-card {
    @apply bg-white rounded-xl border border-amber-200 shadow-sm p-4 hover:shadow-md transition-shadow duration-200;
  }

  /* Dashboard grid */
  .dashboard-grid {
    @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4;
  }
  .quick-actions-grid {
    @apply grid grid-cols-2 gap-3 sm:grid-cols-4;
  }
}
```

- [ ] **Step 2: Verify in browser**

With dev server running, check:
- Body background is warm cream (`#fdf8f3`), not slate-50
- Page titles are brown (`#78350f`), not gray
- Any button with class `btn-primary` is amber, not blue
- Table headers have amber-100 background
- No console errors

- [ ] **Step 3: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: overhaul global CSS to warm amber boutique palette"
```

---

## Task 3: Sidebar — Icon-Only Rewrite

**Files:**
- Modify: `hotel-management-fe/src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Replace Sidebar.jsx**

The key changes: `w-16` instead of `w-64`, icons only (no text labels), `title` for native browser tooltips, amber active state, brown background.

```jsx
import { h } from 'preact';
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
      {/* Desktop icon sidebar */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-16 flex-col items-center py-4 gap-2"
           style={{ backgroundColor: '#7c2d12' }}>
        {/* Logo */}
        <a href="/rooms" className="flex items-center justify-center w-10 h-10 bg-amber-300 rounded-xl mb-4 flex-shrink-0" title="Hotel MS">
          <svg className="w-5 h-5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </a>

        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = currentPath === item.href || (item.href === '/rooms' && currentPath === '/');
          return (
            <a
              key={item.name}
              href={item.href}
              title={item.name}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-amber-300 text-amber-900'
                  : 'text-amber-200 opacity-60 hover:opacity-100 hover:bg-amber-800'
              }`}
            >
              {item.icon}
            </a>
          );
        })}

        {/* Avatar at bottom */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <a
            href="/profile"
            title={user?.name || 'Profile'}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-200 transition-colors"
          >
            {initials}
          </a>
        </div>
      </div>

      {/* Mobile sidebar (full-width overlay, same as before) */}
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
            const isActive = currentPath === item.href || (item.href === '/rooms' && currentPath === '/');
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
```

- [ ] **Step 2: Verify in browser**

Desktop: sidebar is 64px wide, shows only icons, hovering an icon shows tooltip (browser native). Active page icon has amber background. Mobile: hamburger opens full-width sidebar with labels.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.jsx
git commit -m "feat: rewrite sidebar as icon-only 64px with amber active state"
```

---

## Task 4: Header + App.jsx — Shell Wiring

**Files:**
- Modify: `hotel-management-fe/src/components/App.jsx` (line 78: `lg:ml-64` → `lg:ml-16`)
- Modify: `hotel-management-fe/src/components/layout/Header.jsx`

- [ ] **Step 1: Fix main content margin in App.jsx**

Change line 59 and line 78:

```jsx
// line 59 — body background
<div className="min-h-screen flex" style={{ backgroundColor: '#fdf8f3' }}>

// line 78 — main content offset (was lg:ml-64, now lg:ml-16)
<div className="flex-1 flex flex-col min-w-0 lg:ml-16">
```

- [ ] **Step 2: Replace Header.jsx**

```jsx
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useSearch } from '../../hooks/useSearch';

const Header = ({ user, onMenuClick, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { searchTerm, updateSearch, getPlaceholder } = useSearch();

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

      <div className="flex-1 px-4 flex items-center justify-between">
        {/* Global search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              className="block w-full pl-9 pr-3 py-1.5 border border-amber-200 rounded-lg bg-amber-50 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm"
              placeholder={getPlaceholder()}
              type="search"
              value={searchTerm}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Notifications */}
          <button className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* Profile dropdown */}
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
```

- [ ] **Step 3: Verify layout**

The main content area should now sit 64px from the left (not 256px). Header should have amber border, amber search input. No layout overflow issues.

- [ ] **Step 4: Commit**

```bash
git add src/components/App.jsx src/components/layout/Header.jsx
git commit -m "feat: update App margin to lg:ml-16, redesign Header with amber palette"
```

---

## Task 5: Dashboard Page — Room Status Grid

**Files:**
- Modify: `hotel-management-fe/src/components/pages/dashboard/DashboardPage.jsx`

- [ ] **Step 1: Read the current file**

```bash
cat hotel-management-fe/src/components/pages/dashboard/DashboardPage.jsx
```

- [ ] **Step 2: Add a RoomStatusGrid helper inside DashboardPage**

After the existing stats cards section, add a room status grid. Find where rooms data is fetched (or add a `loadRooms` call if absent) and add this component above the recent bookings section:

```jsx
{/* Room Status Grid */}
<div className="card">
  <div className="card-header flex items-center justify-between">
    <h3 className="font-bold text-amber-900">Room Status</h3>
    <a href="/rooms" className="text-xs font-semibold text-amber-600 hover:text-amber-800">View all →</a>
  </div>
  <div className="card-body">
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mb-3">
      {rooms.map((room) => {
        const typeName = room.roomType?.name || 'Room';
        const statusColors = {
          'Available':    'bg-amber-100 text-amber-800 border border-amber-200',
          'Occupied':     'bg-amber-600 text-white border border-amber-700',
          'Maintenance':  'bg-red-100 text-red-800 border border-red-200 border-dashed',
          'Out of Order': 'bg-red-100 text-red-800 border border-red-200 border-dashed',
        };
        return (
          <div
            key={room._id}
            className={`rounded-lg p-2 text-center text-xs ${statusColors[room.status] || statusColors['Available']}`}
            title={`${room.roomNumber} · ${typeName} · ${room.status}`}
          >
            <div className="font-bold">{room.roomNumber}</div>
            <div className="opacity-75 truncate">{typeName.slice(0, 3).toUpperCase()}</div>
          </div>
        );
      })}
    </div>
    <div className="flex flex-wrap gap-3 text-xs text-amber-800">
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-600 inline-block"></span>Occupied</span>
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200 inline-block"></span>Available</span>
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200 inline-block"></span>Maintenance / Out of Order</span>
    </div>
  </div>
</div>
```

Make sure `rooms` state is loaded in the Dashboard. If `loadRooms` doesn't exist in DashboardPage, add:

```jsx
const [rooms, setRooms] = useState([]);

// inside useEffect on mount:
const roomsRes = await apiService.getRooms();
if (roomsRes.success) setRooms(roomsRes.data);
```

- [ ] **Step 3: Verify**

Dashboard shows room chips with number + 3-letter type abbreviation. Occupied chips are amber-filled, available are outlined, maintenance/out-of-order are red dashed.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/dashboard/DashboardPage.jsx
git commit -m "feat: add room status grid with type labels to Dashboard"
```

---

## Task 6: Rooms Page — Card Redesign (No Rates)

**Files:**
- Modify: `hotel-management-fe/src/components/pages/rooms/RoomsPage.jsx`

- [ ] **Step 1: Update status badge helper**

Find or add the `getStatusBadge` helper inside `RoomsPage`:

```jsx
const getStatusBadge = (status) => {
  const map = {
    'Available':    'badge-success',
    'Occupied':     'badge-primary',
    'Maintenance':  'badge-danger',
    'Out of Order': 'badge-danger',
  };
  return map[status] || 'badge-secondary';
};
```

- [ ] **Step 2: Replace the card view JSX**

Find the cards view section (guarded by `viewMode === 'cards'`) and replace the card inner content. Each card should show: room number, type badge, floor, status badge, action buttons — no pricing:

```jsx
{viewMode === 'cards' && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {getPaginatedRooms().map((room) => {
      const typeName = getRoomTypeName(room.roomType);
      return (
        <div key={room._id} className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body">
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-2xl font-extrabold text-amber-900">
                  {room.roomNumber}
                </div>
                <div className="text-xs text-amber-700 mt-0.5">Floor {room.floor}</div>
              </div>
              <span className={getStatusBadge(room.status)}>{room.status}</span>
            </div>

            {/* Type */}
            <div className="mb-4">
              <span className="badge-primary text-xs">{typeName}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {room.status === 'Available' && (
                <button
                  onClick={() => handleBookRoom(room)}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Book
                </button>
              )}
              <button
                onClick={() => { setSelectedRoom(room); setShowDetailsModal(true); }}
                className="btn-outline text-xs px-3 py-1.5"
              >
                Details
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleEdit(room)}
                  className="btn-outline text-xs px-3 py-1.5"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
```

- [ ] **Step 3: Update table view — hide Description and Telephone**

In the table view (`viewMode === 'table'`), remove the Description and Telephone `<th>` and `<td>` columns. The visible columns should be: Room Number, Room Type, Floor, Status, Actions.

- [ ] **Step 4: Verify**

Cards show no pricing. Status badges are color-coded. Table has 5 columns only.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/rooms/RoomsPage.jsx
git commit -m "feat: redesign room cards (no rates), slim table columns, color-coded status"
```

---

## Task 7: Bookings Page — Step Indicator + Card Redesign

**Files:**
- Modify: `hotel-management-fe/src/components/pages/bookings/BookingsPage.jsx`

- [ ] **Step 1: Add StepIndicator component at the top of the file**

Add this before the `BookingsPage` component:

```jsx
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center mb-6">
    {steps.map((step, idx) => {
      const num = idx + 1;
      const isDone   = num < currentStep;
      const isActive = num === currentStep;
      return (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
              isDone   ? 'bg-green-100 border-green-400 text-green-700' :
              isActive ? 'bg-amber-600 border-amber-600 text-white' :
                         'bg-amber-50 border-amber-200 text-amber-400'
            }`}>
              {isDone ? '✓' : num}
            </div>
            <div className={`text-xs mt-1 font-semibold ${isActive ? 'text-amber-700' : 'text-amber-400'}`}>
              {step}
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div className={`h-0.5 w-12 mx-1 mb-4 ${num < currentStep ? 'bg-green-300' : 'bg-amber-200'}`} />
          )}
        </div>
      );
    })}
  </div>
);
```

- [ ] **Step 2: Wire StepIndicator into the booking modal**

Find the multi-step modal JSX. Inside the modal body, at the top before the form fields, add:

```jsx
<StepIndicator
  currentStep={currentStep}
  steps={['Guest Info', 'Room', 'Details']}
/>
```

Replace `currentStep` with whatever variable name the BookingsPage uses for its step state (e.g., `step`, `formStep`, `activeStep`). Read the existing code to find it.

- [ ] **Step 3: Add status filter pills above the bookings list**

Find where the existing status filter dropdown is rendered. Replace it with inline filter pills:

```jsx
{/* Status filter pills */}
<div className="flex flex-wrap gap-2 mb-4">
  {['Active', 'All', 'Checked Out', 'Cancelled', 'No Show'].map((label) => {
    const value = label === 'All' ? '' : label === 'Active' ? 'active' : label.toLowerCase().replace(' ', '_');
    const isSelected = statusFilter === value || (label === 'Active' && statusFilter === 'active');
    return (
      <button
        key={label}
        onClick={() => setStatusFilter(value)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          isSelected
            ? 'bg-amber-600 text-white border-amber-600'
            : 'bg-white text-amber-800 border-amber-200 hover:border-amber-400'
        }`}
      >
        {label}
      </button>
    );
  })}
</div>
```

Note: Check the existing `statusFilter` state values in `BookingsPage.jsx` and match the pill values to what the filter logic expects.

- [ ] **Step 4: Verify**

Open create booking modal — numbered step indicator appears at top. Status pills appear above the bookings list and filter correctly.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/bookings/BookingsPage.jsx
git commit -m "feat: add step indicator to booking modal, replace status dropdown with filter pills"
```

---

## Task 8: Guests Page — Inline Search Bar

**Files:**
- Modify: `hotel-management-fe/src/components/pages/guests/GuestsPage.jsx`

The page already filters via the global `searchTerm` from `useSearch`. We add a *local* search bar that filters independently (or in addition).

- [ ] **Step 1: Add local search state**

Add at the top of the `GuestsPage` component (after existing state declarations):

```jsx
const [localSearch, setLocalSearch] = useState('');
```

- [ ] **Step 2: Replace the `filteredGuests` derivation**

The existing `useEffect` filters by `searchTerm` (global). Extend it to also apply `localSearch`:

```jsx
useEffect(() => {
  let result = guests;
  const globalQ = searchTerm?.toLowerCase() || '';
  const localQ  = localSearch.toLowerCase();
  const q = localQ || globalQ;

  if (q) {
    result = guests.filter(guest => {
      return (
        guest.firstName?.toLowerCase().includes(q) ||
        guest.lastName?.toLowerCase().includes(q) ||
        guest.phone?.includes(q) ||
        guest.idNumber?.toLowerCase().includes(q)
      );
    });
  }

  setFilteredGuests(result);
  setCurrentPage(1);
}, [guests, searchTerm, localSearch]);
```

- [ ] **Step 3: Add the search bar UI above the table**

Insert this block between the page header and the table:

```jsx
{/* Stats cards */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div className="stats-card flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <div>
      <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Total Guests</div>
      <div className="text-2xl font-extrabold text-amber-900">{guests.length}</div>
    </div>
  </div>
  <div className="stats-card flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    </div>
    <div>
      <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">New Today</div>
      <div className="text-2xl font-extrabold text-amber-900">
        {guests.filter(g => new Date(g.createdAt).toDateString() === new Date().toDateString()).length}
      </div>
    </div>
  </div>
  <div className="stats-card flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div>
      <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">This Week</div>
      <div className="text-2xl font-extrabold text-amber-900">
        {guests.filter(g => new Date(g.createdAt) >= new Date(Date.now() - 7 * 864e5)).length}
      </div>
    </div>
  </div>
</div>

{/* Inline search bar */}
<div>
  <div className="relative flex items-center border-2 border-amber-400 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-amber-300 focus-within:border-amber-500">
    <div className="pl-4 flex items-center pointer-events-none">
      <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    </div>
    <input
      type="text"
      value={localSearch}
      onInput={(e) => setLocalSearch(e.target.value)}
      placeholder="Search by name, phone, or ID number..."
      className="flex-1 pl-3 pr-4 py-3 bg-transparent text-amber-900 placeholder-amber-300 focus:outline-none text-sm"
    />
    {localSearch && (
      <button
        onClick={() => setLocalSearch('')}
        className="pr-4 text-amber-400 hover:text-amber-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
  <div className="text-xs text-amber-600 mt-1.5 pl-1">
    Showing {filteredGuests.length} of {guests.length} guests
  </div>
</div>
```

- [ ] **Step 4: Update table columns**

Replace the existing `<thead>` with:

```jsx
<thead className="table-header">
  <tr>
    <th className="table-header-cell">Guest</th>
    <th className="table-header-cell">Phone</th>
    <th className="table-header-cell">ID / Passport</th>
    <th className="table-header-cell">Registered</th>
  </tr>
</thead>
```

Update each `<tr>` in `<tbody>` to use the new avatar style:

```jsx
<tr key={guest._id} className="table-row">
  <td className="table-cell">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-amber-900">
          {(guest.firstName?.[0] || '') + (guest.lastName?.[0] || '')}
        </span>
      </div>
      <div>
        <div className="font-semibold text-amber-900">
          {guest.firstName} {guest.lastName}
        </div>
        {guest.notes && (
          <button
            onClick={() => { setSelectedGuest(guest); setShowNotesModal(true); }}
            className="text-xs text-amber-600 hover:text-amber-800 font-medium"
          >
            View notes
          </button>
        )}
      </div>
    </div>
  </td>
  <td className="table-cell text-amber-800">{guest.phone}</td>
  <td className="table-cell">
    <div className="text-sm font-medium text-amber-900">{guest.idType}</div>
    <div className="text-xs text-amber-600 font-mono">{guest.idNumber}</div>
  </td>
  <td className="table-cell text-amber-700">
    {new Date(guest.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
  </td>
</tr>
```

Remove the old statistics card section at the bottom (stats are now shown at the top).

- [ ] **Step 5: Verify**

Type in the search bar — list filters instantly. "Showing X of Y guests" count updates. Clear (×) button removes the query. Stats cards at top show correct counts.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/guests/GuestsPage.jsx
git commit -m "feat: add inline search bar + stats cards to Guests page"
```

---

## Task 9: Food Menu — Pill Tabs + Toggle Availability

**Files:**
- Modify: `hotel-management-fe/src/components/pages/food-menu/FoodMenuPage.jsx`

- [ ] **Step 1: Read current file to find category state and item list**

```bash
cat hotel-management-fe/src/components/pages/food-menu/FoodMenuPage.jsx
```

- [ ] **Step 2: Replace category filter tabs with pill tabs**

Find the existing category filter UI and replace with:

```jsx
{/* Category pill tabs */}
<div className="flex flex-wrap gap-2 mb-4">
  {['All', ...categories].map((cat) => {
    const count = cat === 'All'
      ? menuItems.length
      : menuItems.filter(i => i.category === cat).length;
    const isActive = activeCategory === cat;
    return (
      <button
        key={cat}
        onClick={() => setActiveCategory(cat)}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
          isActive
            ? 'bg-amber-600 text-white border-amber-600'
            : 'bg-white text-amber-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50'
        }`}
      >
        {cat}
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
          isActive ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'
        }`}>
          {count}
        </span>
      </button>
    );
  })}
</div>
```

Note: `categories` should be derived from unique category values in `menuItems`. If not already present, add:

```jsx
const categories = [...new Set(menuItems.map(i => i.category))].sort();
```

- [ ] **Step 3: Update item card to show toggle-style availability**

Find the item card JSX and update the availability section:

```jsx
{/* Availability toggle row */}
<div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-100">
  <span className={`text-xs font-semibold ${item.isAvailable ? 'text-green-700' : 'text-amber-400'}`}>
    {item.isAvailable ? 'Available' : 'Unavailable'}
  </span>
  {user?.role === 'admin' && (
    <button
      onClick={() => handleToggleAvailability(item)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${
        item.isAvailable ? 'bg-amber-600' : 'bg-amber-200'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        item.isAvailable ? 'translate-x-4' : 'translate-x-1'
      }`} />
    </button>
  )}
</div>
```

Make sure `handleToggleAvailability` exists — it should call `apiService.updateMenuItem(item._id, { isAvailable: !item.isAvailable })` and then reload items.

- [ ] **Step 4: Dim unavailable cards**

Add `opacity-60` class to the outer card wrapper when `!item.isAvailable`.

- [ ] **Step 5: Verify**

Category pills show item counts. Clicking a pill filters the grid. Availability toggle animates. Unavailable items are dimmed.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/food-menu/FoodMenuPage.jsx
git commit -m "feat: amber pill tabs with counts, toggle-style availability for Food Menu"
```

---

## Task 10: Reports Page — Revenue + Occupancy Tabs

**Files:**
- Modify: `hotel-management-fe/src/components/pages/reports/ReportsPage.jsx`

- [ ] **Step 1: Add Revenue and Occupancy to the tabs array**

Find:
```js
const tabs = [
  { id: 'bookings', name: 'Booking Reports', icon: 'calendar' }
];
```

Replace with:
```js
const tabs = [
  { id: 'bookings',  name: 'Bookings'  },
  { id: 'revenue',   name: 'Revenue'   },
  { id: 'occupancy', name: 'Occupancy' },
];
```

- [ ] **Step 2: Replace the tab bar JSX**

Find the existing tab button rendering and replace with pill-style tabs:

```jsx
<div className="flex gap-2 mb-6">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
        activeTab === tab.id
          ? 'bg-amber-600 text-white border-amber-600'
          : 'bg-white text-amber-800 border-amber-200 hover:border-amber-400'
      }`}
    >
      {tab.name}
    </button>
  ))}
</div>
```

- [ ] **Step 3: Add Revenue tab content**

Find where the tab content is rendered (likely a switch or if/else on `activeTab`). Add the Revenue tab content:

```jsx
{activeTab === 'revenue' && (
  <div className="space-y-4">
    {/* Summary cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="stats-card">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Total Revenue</div>
        <div className="text-2xl font-extrabold text-amber-900">
          ₱{(revenueReports.totalRevenue || 0).toLocaleString()}
        </div>
      </div>
      <div className="stats-card">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Total Bookings</div>
        <div className="text-2xl font-extrabold text-amber-900">
          {revenueReports.totalBookings || 0}
        </div>
      </div>
      <div className="stats-card">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Avg / Booking</div>
        <div className="text-2xl font-extrabold text-amber-900">
          ₱{(revenueReports.averageRevenue || 0).toLocaleString()}
        </div>
      </div>
    </div>

    {/* Revenue by room type */}
    {revenueReports.revenueByRoomType?.length > 0 && (
      <div className="table-container">
        <div className="card-header">
          <h3 className="font-bold text-amber-900">Revenue by Room Type</h3>
        </div>
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Room Type</th>
              <th className="table-header-cell">Bookings</th>
              <th className="table-header-cell">Revenue</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {revenueReports.revenueByRoomType.map((row, i) => (
              <tr key={i} className="table-row">
                <td className="table-cell font-semibold text-amber-900">{row.roomType}</td>
                <td className="table-cell">{row.count}</td>
                <td className="table-cell font-semibold">₱{row.revenue?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 4: Add Occupancy tab content**

```jsx
{activeTab === 'occupancy' && (
  <div className="space-y-4">
    {/* Summary cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="stats-card">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Occupancy Rate</div>
        <div className="text-2xl font-extrabold text-amber-900">
          {occupancyReports.occupancyRate || 0}%
        </div>
      </div>
      <div className="stats-card">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Occupied Rooms</div>
        <div className="text-2xl font-extrabold text-amber-900">
          {occupancyReports.occupiedRooms || 0}
        </div>
      </div>
      <div className="stats-card">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Available Rooms</div>
        <div className="text-2xl font-extrabold text-amber-900">
          {occupancyReports.availableRooms || 0}
        </div>
      </div>
    </div>

    {/* Occupancy bar */}
    <div className="card">
      <div className="card-body">
        <div className="flex justify-between text-xs font-semibold text-amber-700 mb-2">
          <span>Occupancy</span>
          <span>{occupancyReports.occupancyRate || 0}%</span>
        </div>
        <div className="w-full bg-amber-100 rounded-full h-4 border border-amber-200">
          <div
            className="bg-amber-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${occupancyReports.occupancyRate || 0}%` }}
          />
        </div>
      </div>
    </div>

    {/* Breakdown by room type */}
    {occupancyReports.occupancyByRoomType?.length > 0 && (
      <div className="table-container">
        <div className="card-header">
          <h3 className="font-bold text-amber-900">Occupancy by Room Type</h3>
        </div>
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Room Type</th>
              <th className="table-header-cell">Total</th>
              <th className="table-header-cell">Occupied</th>
              <th className="table-header-cell">Rate</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {occupancyReports.occupancyByRoomType.map((row, i) => (
              <tr key={i} className="table-row">
                <td className="table-cell font-semibold text-amber-900">{row.roomType}</td>
                <td className="table-cell">{row.total}</td>
                <td className="table-cell">{row.occupied}</td>
                <td className="table-cell">
                  <span className="badge-primary">{row.rate}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 5: Verify**

All 3 tabs are visible as pills. Clicking Revenue/Occupancy loads data and shows stat cards. Occupancy bar animates to the correct percentage.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/reports/ReportsPage.jsx
git commit -m "feat: implement Revenue and Occupancy report tabs with stat cards"
```

---

## Task 11: Users Page — Stacked Name/Email + Filter Pills

**Files:**
- Modify: `hotel-management-fe/src/components/pages/users/UsersPage.jsx`

- [ ] **Step 1: Read current file to find column structure**

```bash
cat hotel-management-fe/src/components/pages/users/UsersPage.jsx
```

- [ ] **Step 2: Update table header — merge name + email columns**

Replace the Name and Email `<th>` cells with a single `<th>`:

```jsx
<th className="table-header-cell">User</th>
<th className="table-header-cell">Role</th>
<th className="table-header-cell">Status</th>
<th className="table-header-cell">Created</th>
<th className="table-header-cell">Actions</th>
```

- [ ] **Step 3: Update each table row**

Replace the Name + Email separate `<td>` cells with one stacked cell:

```jsx
<td className="table-cell">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-amber-900">
        {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </span>
    </div>
    <div>
      <div className="font-semibold text-amber-900 text-sm">{user.name}</div>
      <div className="text-xs text-amber-600 truncate max-w-[180px]">{user.email}</div>
    </div>
  </div>
</td>
```

Update role badge — Admin = `badge-primary`, Staff/user = `badge-secondary`:

```jsx
<td className="table-cell">
  <span className={user.role === 'admin' ? 'badge-primary' : 'badge-secondary capitalize'}>
    {user.role}
  </span>
</td>
```

Update status badge — Active = `badge-success`, Inactive = `badge-secondary`:

```jsx
<td className="table-cell">
  <span className={user.isActive !== false ? 'badge-success' : 'badge-secondary'}>
    {user.isActive !== false ? 'Active' : 'Inactive'}
  </span>
</td>
```

- [ ] **Step 4: Add inline filter pills**

Find the existing search/filter bar and add role + status filter pills:

```jsx
<div className="flex flex-wrap gap-2 mb-4">
  {['All', 'Admin', 'Staff'].map((r) => {
    const val = r === 'All' ? '' : r.toLowerCase();
    return (
      <button
        key={r}
        onClick={() => setRoleFilter(val)}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          roleFilter === val
            ? 'bg-amber-600 text-white border-amber-600'
            : 'bg-white text-amber-800 border-amber-200 hover:border-amber-400'
        }`}
      >
        {r}
      </button>
    );
  })}
</div>
```

- [ ] **Step 5: Verify**

Name + email appear stacked in one column. Role/status badges use amber/green. Filter pills work.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/users/UsersPage.jsx
git commit -m "feat: stacked user card in table, filter pills, amber/green role badges"
```

---

## Task 12: Settings Page — Stacked Layout + Pricing Grid

**Files:**
- Modify: `hotel-management-fe/src/components/pages/settings/SettingsPage.jsx`

- [ ] **Step 1: Read current file**

```bash
cat hotel-management-fe/src/components/pages/settings/SettingsPage.jsx
```

- [ ] **Step 2: Change layout from 2-col to stacked**

Find the outer wrapper with `grid-cols-2` or `lg:grid-cols-2` and change to a single-column stack:

```jsx
{/* Was: <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
<div className="space-y-6">
  {/* Form section */}
  <div className="card">
    <div className="card-header">
      <h3 className="font-bold text-amber-900">{editingRoomType ? 'Edit Room Type' : 'Add Room Type'}</h3>
    </div>
    <div className="card-body">
      {/* ... existing form fields unchanged ... */}
    </div>
  </div>

  {/* Room types list */}
  <div className="card">
    <div className="card-header">
      <h3 className="font-bold text-amber-900">Room Types</h3>
    </div>
    {/* ... existing list unchanged ... */}
  </div>
</div>
```

- [ ] **Step 3: Update pricing fields to 2×2 grid**

Find the pricing fields and wrap them in a labeled 2×2 grid:

```jsx
<div className="form-group">
  <label className="form-label">Pricing</label>
  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="text-xs font-semibold text-amber-700 mb-1 block">3 Hours</label>
      <input
        type="number"
        value={formData.pricing?.hourly3 || ''}
        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, hourly3: e.target.value}})}
        className="form-input"
        placeholder="₱0"
      />
    </div>
    <div>
      <label className="text-xs font-semibold text-amber-700 mb-1 block">8 Hours</label>
      <input
        type="number"
        value={formData.pricing?.hourly8 || ''}
        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, hourly8: e.target.value}})}
        className="form-input"
        placeholder="₱0"
      />
    </div>
    <div>
      <label className="text-xs font-semibold text-amber-700 mb-1 block">12 Hours</label>
      <input
        type="number"
        value={formData.pricing?.hourly12 || ''}
        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, hourly12: e.target.value}})}
        className="form-input"
        placeholder="₱0"
      />
    </div>
    <div>
      <label className="text-xs font-semibold text-amber-700 mb-1 block">24 Hours</label>
      <input
        type="number"
        value={formData.pricing?.daily || ''}
        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, daily: e.target.value}})}
        className="form-input"
        placeholder="₱0"
      />
    </div>
  </div>
</div>
```

Check the existing `formData` shape and `setFormData` usage before replacing — adapt field names if they differ.

- [ ] **Step 4: Verify**

Form appears full-width above the list. Pricing fields are in a clean 2×2 grid with labels. No visual overflow on tablet.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/settings/SettingsPage.jsx
git commit -m "feat: stacked Settings layout, 2x2 pricing grid for room types"
```

---

## Task 13: Profile Page — Full Implementation

**Files:**
- Modify: `hotel-management-fe/src/components/pages/profile/ProfilePage.jsx`

- [ ] **Step 1: Replace the placeholder with a full profile page**

```jsx
import { h } from 'preact';
import { useState } from 'preact/hooks';
import apiService from '../../../services/api';

const ProfilePage = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const payload = { name: formData.name };
      if (formData.currentPassword && formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await apiService.updateProfile(payload);
      if (res.success) {
        setSuccess('Profile updated successfully.');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account details and password.</p>
      </div>

      {/* Profile card */}
      <div className="card">
        <div className="card-body flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-extrabold text-white">{initials}</span>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-900">{user?.name}</div>
            <div className="text-sm text-amber-700">{user?.email}</div>
            <span className="badge-primary capitalize mt-1 inline-block">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-bold text-amber-900">Edit Profile</h3>
        </div>
        <div className="card-body">
          {success && <div className="alert-success">{success}</div>}
          {error   && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="border-t border-amber-100 pt-5">
              <h4 className="text-sm font-bold text-amber-800 mb-4">Change Password <span className="text-amber-400 font-normal">(optional)</span></h4>
              <div className="space-y-3">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onInput={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="form-input"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onInput={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="form-input"
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onInput={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="form-input"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
```

- [ ] **Step 2: Check if `apiService.updateProfile` exists**

```bash
grep -n "updateProfile" hotel-management-fe/src/services/api.js
```

If it doesn't exist, add it to `api.js`:

```js
updateProfile: async (data) => {
  return apiService.request('/auth/updatedetails', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
},
```

Also check the backend route — `/api/v1/auth/updatedetails` should accept `name`, `currentPassword`, and `newPassword`. If the backend endpoint uses a different shape, adjust the payload in `handleSubmit`.

- [ ] **Step 3: Verify**

Profile page shows avatar with initials, name + email + role. Form saves name change. Password fields validate (mismatch shows error). Success message appears after save.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/profile/ProfilePage.jsx src/services/api.js
git commit -m "feat: implement Profile page with avatar, edit form, and password change"
```

---

## Verification Checklist

After all tasks are complete, run through this list:

- [ ] `npm run dev` starts without errors
- [ ] Body background is warm cream (`#fdf8f3`), font is Plus Jakarta Sans
- [ ] Desktop: sidebar is 64px icon-only, tooltips show on hover, active icon has amber fill
- [ ] Mobile: hamburger opens full-width sidebar with labels
- [ ] Main content area has correct left margin (not overlapping sidebar)
- [ ] All `btn-primary` buttons are amber, not blue
- [ ] All table headers have amber-100 background
- [ ] Dashboard: room chips show number + 3-letter type, amber=occupied, outlined=available, red=maintenance
- [ ] Rooms page: cards show no pricing; status badges color-coded; table has 5 columns
- [ ] Bookings page: step indicator visible in create modal; status filter pills above list
- [ ] Guests page: inline search bar filters in real-time; stats cards at top; result count updates; clear (×) works
- [ ] Food Menu: category pills show item counts; availability toggle animates; unavailable items dimmed
- [ ] Reports: 3 tabs work; Revenue/Occupancy tabs show stat cards and tables
- [ ] Users: stacked name/email column; role = amber badge, staff = gray badge; filter pills work
- [ ] Settings: form is full-width above list; pricing in 2×2 grid
- [ ] Profile: avatar shows initials; edit form saves; password mismatch shows error
- [ ] Receipt page (print): no visual regression, `.no-print` still hides elements
