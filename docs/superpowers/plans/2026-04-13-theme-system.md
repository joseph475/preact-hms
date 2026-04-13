# Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a configurable two-theme system (Warm Amber default + Light Blue) controlled via `REACT_APP_THEME` env var with runtime toggle in Settings persisted to `localStorage`.

**Architecture:** CSS custom properties define the amber palette on `:root` (default) and override with `:root.theme-blue` for the blue palette. Tailwind's `primary` scale is remapped to these CSS vars so all existing `primary-*` utility classes theme-switch automatically. A `ThemeProvider` context applies `theme-blue` to `document.documentElement` and exposes `useTheme()` for the Settings toggle.

**Tech Stack:** Preact 10, Webpack 5 (DefinePlugin), Tailwind CSS v3, CSS custom properties

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `hotel-management-fe/src/styles/index.css` | Modify | Add CSS var token blocks; update body; change all `amber-*` `@apply` to `primary-*` |
| `hotel-management-fe/tailwind.config.js` | Modify | Remap `primary` scale + `sidebar` color to CSS vars |
| `hotel-management-fe/src/context/ThemeContext.jsx` | Create | ThemeProvider + useTheme hook |
| `hotel-management-fe/src/index.js` | Modify | Flash-free theme init + wrap App in ThemeProvider |
| `hotel-management-fe/webpack.config.js` | Modify | Add `REACT_APP_THEME` to DefinePlugin |
| `hotel-management-fe/src/components/layout/Sidebar.jsx` | Modify | Replace `style={{ backgroundColor: '#7c2d12' }}` + all `amber-*` classes with `bg-sidebar` + `primary-*` |
| `hotel-management-fe/src/components/pages/settings/SettingsPage.jsx` | Modify | Add Appearance card with split-circle theme swatches |

---

### Task 1: Add CSS variable token blocks to `index.css`

**Files:**
- Modify: `hotel-management-fe/src/styles/index.css`

- [ ] **Step 1: Insert theme token blocks after the `@import` line**

Add the following immediately after the first line (`@import url(...)`), before `@tailwind base`:

```css
/* ─── Theme tokens ─────────────────────────────────── */
/* Amber is the default — active with no class on <html> */
:root {
  --primary-50:  #fef9f0;
  --primary-100: #fef3c7;
  --primary-200: #fde68a;
  --primary-300: #fcd34d;
  --primary-400: #fbbf24;
  --primary-500: #f59e0b;
  --primary-600: #d97706;
  --primary-700: #b45309;
  --primary-800: #92400e;
  --primary-900: #78350f;
  --color-sidebar-bg: #7c2d12;
  --color-body-bg:    #fdf8f3;
  --color-bone-start: #fef3c7;
  --color-bone-end:   #fde68a;
}

/* Light Blue override — active when <html class="theme-blue"> */
:root.theme-blue {
  --primary-50:  #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  --color-sidebar-bg: #1e3a8a;
  --color-body-bg:    #f0f4ff;
  --color-bone-start: #dbeafe;
  --color-bone-end:   #bfdbfe;
}
```

- [ ] **Step 2: Update `body` in `@layer base` to use CSS vars**

Replace the hardcoded hex values in the `body` rule:

```css
body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-weight: 400;
  line-height: 1.5;
  color: var(--primary-900);
  background-color: var(--color-body-bg);
}
```

- [ ] **Step 3: Verify amber theme unchanged**

```bash
cd hotel-management-fe && npm run dev
```

Open http://localhost:3002. App should look identical — vars mirror the hardcoded values exactly.

- [ ] **Step 4: Commit**

```bash
git add hotel-management-fe/src/styles/index.css
git commit -m "feat: add CSS variable token blocks for amber and blue themes"
```

---

### Task 2: Remap `tailwind.config.js` to CSS vars

**Files:**
- Modify: `hotel-management-fe/tailwind.config.js`

- [ ] **Step 1: Replace the entire file**

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
          50:  'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        sidebar: 'var(--color-sidebar-bg)',
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif:   ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

Notes:
- `primary.*` now resolves at runtime to whichever CSS var is active — all existing `text-primary-*`, `bg-primary-*` classes in JSX automatically theme-switch
- `sidebar: 'var(--color-sidebar-bg)'` enables `bg-sidebar` utility for Sidebar.jsx
- `backgroundColor.app` removed — body background now set via CSS var directly in `index.css`

- [ ] **Step 2: Verify the dev server still loads**

```bash
cd hotel-management-fe && npm run dev
```

App should still be amber, all styles intact.

- [ ] **Step 3: Commit**

```bash
git add hotel-management-fe/tailwind.config.js
git commit -m "feat: remap tailwind primary scale and sidebar color to CSS vars"
```

---

### Task 3: Migrate all `amber-*` `@apply` directives in `index.css` to `primary-*`

**Files:**
- Modify: `hotel-management-fe/src/styles/index.css`

- [ ] **Step 1: Replace the entire `@layer components { ... }` block**

Replace everything from `@layer components {` to its closing `}` with the following:

```css
@layer components {
  /* Page Layout */
  .page-container { @apply space-y-4; }
  .page-header { @apply mb-4 pb-3 border-b border-primary-200; }
  .page-title { @apply text-2xl font-bold text-primary-900 mb-1; }
  .page-subtitle { @apply text-base text-primary-800 leading-normal; }
  .section-spacing { @apply mb-4; }
  .content-section { @apply mb-4; }

  /* Buttons */
  .btn {
    @apply inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:shadow-md;
  }
  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 hover:-translate-y-0.5;
  }
  .btn-secondary {
    @apply btn bg-primary-100 text-primary-900 border border-primary-200 hover:bg-primary-200 focus:ring-primary-400 hover:-translate-y-0.5;
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
    @apply btn bg-white border-primary-200 text-primary-800 hover:bg-primary-50 focus:ring-primary-400 hover:border-primary-300;
  }

  /* Forms */
  .form-group { @apply mb-3; }
  .form-row { @apply grid grid-cols-1 gap-3 sm:grid-cols-2; }
  .form-row-3 { @apply grid grid-cols-1 gap-3 sm:grid-cols-3; }
  .form-label { @apply block text-sm font-semibold text-primary-800 mb-1; }
  .form-input {
    @apply block w-full px-3 py-2 border border-primary-200 rounded-lg shadow-sm text-primary-900 placeholder-primary-300 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 sm:text-sm transition-colors duration-200;
  }
  .form-select {
    @apply block w-full px-3 py-2 border border-primary-200 rounded-lg shadow-sm text-primary-900 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 sm:text-sm transition-colors duration-200;
  }
  .form-textarea {
    @apply block w-full px-3 py-2 border border-primary-200 rounded-lg shadow-sm text-primary-900 placeholder-primary-300 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 sm:text-sm resize-none transition-colors duration-200;
  }

  /* Cards */
  .card {
    @apply bg-white rounded-xl border border-primary-200 shadow-sm p-4;
  }
  .card-elevated {
    @apply bg-white rounded-xl border border-primary-200 shadow-md hover:shadow-lg transition-shadow duration-200;
  }
  .card-header {
    @apply px-6 py-4 border-b border-primary-100 bg-primary-50 rounded-t-xl;
  }
  .card-body { @apply px-6 py-4; }
  .card-footer {
    @apply px-6 py-4 border-t border-primary-100 bg-primary-50 rounded-b-xl;
  }
  .stats-card {
    @apply bg-white rounded-xl border border-primary-200 shadow-sm p-5;
  }

  /* Tables */
  .table-container {
    @apply bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden;
  }
  .table { @apply min-w-full divide-y divide-primary-100; }
  .table-header { @apply bg-primary-100; }
  .table-header-cell {
    @apply px-4 py-3 text-left text-xs font-bold text-primary-800 uppercase tracking-wider;
  }
  .table-body { @apply bg-white divide-y divide-primary-50; }
  .table-row { @apply hover:bg-primary-50 transition-colors duration-150; }
  .table-cell { @apply px-4 py-3 text-sm text-primary-900; }

  /* Badges */
  .badge-success  { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200; }
  .badge-warning  { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200; }
  .badge-danger   { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200; }
  .badge-info     { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200; }
  .badge-primary  { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 border border-primary-200; }
  .badge-secondary { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200; }

  /* Sidebar nav */
  .sidebar-nav { @apply space-y-1; }
  .sidebar-nav-item {
    @apply flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200;
  }
  .sidebar-nav-item-active  { @apply sidebar-nav-item bg-primary-200 text-primary-900; }
  .sidebar-nav-item-inactive { @apply sidebar-nav-item text-primary-100 hover:bg-primary-800 hover:text-white; }

  /* Modals */
  .modal-overlay {
    @apply fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm !m-0;
  }
  .modal-container {
    @apply relative bg-white rounded-2xl shadow-2xl w-full border border-primary-200 max-w-lg lg:max-w-2xl;
  }
  .modal-header {
    @apply flex items-center justify-between px-6 py-4 border-b border-primary-100 bg-primary-50 rounded-t-2xl;
  }
  .modal-title  { @apply text-lg font-bold text-primary-900; }
  .modal-body   { @apply px-6 py-4; }
  .modal-footer {
    @apply flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-100 bg-primary-50 rounded-b-2xl;
  }

  /* Alerts */
  .alert-success { @apply p-4 mb-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg text-green-800 text-sm; }
  .alert-error   { @apply p-4 mb-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-red-800 text-sm; }
  .alert-warning { @apply p-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg text-yellow-800 text-sm; }
  .alert-info    { @apply p-4 mb-4 bg-primary-50 border-l-4 border-primary-400 rounded-r-lg text-primary-800 text-sm; }

  /* Empty states */
  .empty-state             { @apply text-center py-12; }
  .empty-state-icon        { @apply mx-auto h-12 w-12 text-primary-300 mb-4; }
  .empty-state-title       { @apply text-lg font-bold text-primary-900 mb-2; }
  .empty-state-description { @apply text-sm text-primary-700 max-w-sm mx-auto; }

  /* Spinner */
  .spinner {
    @apply animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600;
  }

  /* Skeleton bone — uses CSS vars for theme-aware shimmer */
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }

  .bone {
    background: linear-gradient(90deg, var(--color-bone-start) 30%, var(--color-bone-end) 50%, var(--color-bone-start) 70%);
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
    border-radius: 6px;
  }

  /* Scrollbar */
  .custom-scrollbar::-webkit-scrollbar       { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: var(--primary-50); }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--primary-200); border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--primary-600); }

  /* Status dots */
  .status-dot        { @apply inline-block w-2 h-2 rounded-full mr-1.5; }
  .status-dot-green  { @apply status-dot bg-green-500; }
  .status-dot-yellow { @apply status-dot bg-yellow-500; }
  .status-dot-red    { @apply status-dot bg-red-500; }
  .status-dot-amber  { @apply status-dot bg-primary-500; }
  .status-dot-gray   { @apply status-dot bg-gray-400; }

  /* Responsive text */
  .responsive-text { @apply text-sm sm:text-base; }

  /* Focus ring */
  .focus-ring { @apply focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2; }

  /* Print */
  @media print {
    .no-print    { display: none !important; }
    .print-break { page-break-after: always; }
  }

  /* Booking cards */
  .booking-card {
    @apply bg-white rounded-xl border border-primary-200 shadow-sm p-4 hover:shadow-md transition-shadow duration-200;
  }

  /* Dashboard grid */
  .dashboard-grid     { @apply grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4; }
  .quick-actions-grid { @apply grid grid-cols-2 gap-3 sm:grid-cols-4; }

  /* Badge base */
  .badge { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold; }

  /* Action button container */
  .action-buttons { @apply flex items-center gap-1; }

  /* Action buttons */
  .action-btn {
    @apply inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-200;
  }
  .action-btn-icon {
    @apply inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200;
  }

  .action-btn-primary  { @apply action-btn bg-primary-100 text-primary-700 hover:bg-primary-200; }
  .action-btn-success  { @apply action-btn bg-green-100 text-green-700 hover:bg-green-200; }
  .action-btn-warning  { @apply action-btn bg-yellow-100 text-yellow-700 hover:bg-yellow-200; }
  .action-btn-info     { @apply action-btn bg-primary-50 text-primary-700 hover:bg-primary-100; }
  .action-btn-danger   { @apply action-btn bg-red-100 text-red-700 hover:bg-red-200; }

  .action-btn-icon-primary { @apply action-btn-icon bg-primary-100 text-primary-700 hover:bg-primary-200; }
  .action-btn-icon-info    { @apply action-btn-icon bg-primary-50 text-primary-700 hover:bg-primary-100; }
  .action-btn-icon-danger  { @apply action-btn-icon bg-red-100 text-red-700 hover:bg-red-200; }

  /* Table scroll */
  .table-container-scroll { @apply overflow-x-auto; }

  /* Dashboard section */
  .dashboard-section { @apply grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6; }

  /* Quick action item */
  .quick-action-item {
    @apply flex flex-col items-center justify-center p-4 rounded-xl border border-primary-200 bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer text-center;
  }
}
```

- [ ] **Step 2: Verify amber theme unchanged**

```bash
cd hotel-management-fe && npm run dev
```

Navigate through Dashboard, Bookings, Rooms, Settings. Everything should be visually identical to the original.

- [ ] **Step 3: Quick-smoke the blue theme**

In browser DevTools console:
```js
document.documentElement.classList.add('theme-blue')
```

All page elements (table headers, cards, badges, buttons, form inputs, skeleton bones) should immediately shift to blue tones. Run:
```js
document.documentElement.classList.remove('theme-blue')
```
to revert.

- [ ] **Step 4: Commit**

```bash
git add hotel-management-fe/src/styles/index.css
git commit -m "feat: migrate all CSS component classes from amber to primary tokens"
```

---

### Task 4: Create `ThemeContext.jsx`

**Files:**
- Create: `hotel-management-fe/src/context/ThemeContext.jsx`

- [ ] **Step 1: Create the file**

```jsx
import { h, createContext } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';

const STORAGE_KEY = 'hms-theme';
const VALID_THEMES = ['amber', 'blue'];
const DEFAULT_THEME = VALID_THEMES.includes(process.env.REACT_APP_THEME)
  ? process.env.REACT_APP_THEME
  : 'amber';

const ThemeContext = createContext({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return VALID_THEMES.includes(stored) ? stored : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    if (theme === 'blue') {
      document.documentElement.classList.add('theme-blue');
    } else {
      document.documentElement.classList.remove('theme-blue');
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

- [ ] **Step 2: Commit**

```bash
git add hotel-management-fe/src/context/ThemeContext.jsx
git commit -m "feat: add ThemeProvider context with localStorage persistence"
```

---

### Task 5: Wire ThemeProvider + add `REACT_APP_THEME` to webpack

**Files:**
- Modify: `hotel-management-fe/webpack.config.js`
- Modify: `hotel-management-fe/src/index.js`

- [ ] **Step 1: Update `webpack.config.js` DefinePlugin**

In the `DefinePlugin` block (currently lines 59–62), add the new env var:

```js
new webpack.DefinePlugin({
  'process.env.NODE_ENV':         JSON.stringify(process.env.NODE_ENV || 'development'),
  'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || ''),
  'process.env.REACT_APP_THEME':  JSON.stringify(process.env.REACT_APP_THEME || 'amber'),
}),
```

- [ ] **Step 2: Update `src/index.js`**

Apply the saved theme class *synchronously* before render (prevents flash-of-wrong-theme), then wrap `<App>` in `<ThemeProvider>`:

```js
import { h, render } from 'preact';
import { ThemeProvider } from './context/ThemeContext';
import App from './components/App';
import './styles/index.css';

// Apply saved theme before first paint to avoid flash
try {
  if (localStorage.getItem('hms-theme') === 'blue') {
    document.documentElement.classList.add('theme-blue');
  }
} catch {}

render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
  document.getElementById('app')
);
```

- [ ] **Step 3: Verify amber default still loads**

```bash
cd hotel-management-fe && npm run dev
```

App loads in amber. DevTools → `<html>` element: no `theme-blue` class present.

- [ ] **Step 4: Verify blue theme via env var**

Stop dev server, then:

```bash
REACT_APP_THEME=blue npm run dev
```

Open http://localhost:3002 (no prior `localStorage`). DevTools → `<html>` should have `class="theme-blue"`. Body background should be `#f0f4ff`.

- [ ] **Step 5: Commit**

```bash
git add hotel-management-fe/webpack.config.js hotel-management-fe/src/index.js
git commit -m "feat: wire ThemeProvider and flash-free theme initialisation"
```

---

### Task 6: Update `Sidebar.jsx` to use theme-aware classes

**Files:**
- Modify: `hotel-management-fe/src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Replace the entire file**

The only changes are: remove both `style={{ backgroundColor: '#7c2d12' }}` inline styles (replaced by `bg-sidebar` className) and replace every `amber-*` Tailwind class with its `primary-*` equivalent.

```jsx
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
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-48 flex-col py-4 px-3 gap-1 bg-sidebar">
        {/* Logo */}
        <a href="/dashboard" className="flex items-center gap-2 px-2 py-2 mb-3 flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-300 rounded-lg flex-shrink-0">
            <svg className="w-4 h-4 text-primary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-primary-200 font-bold text-sm">Hotel MS</span>
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
                  ? 'bg-primary-300 text-primary-900'
                  : 'text-primary-200 opacity-70 hover:opacity-100 hover:bg-primary-800'
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
            className="flex items-center gap-2 px-2 py-2 rounded-xl text-primary-200 hover:bg-primary-800 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-300 text-primary-900 text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-primary-100 truncate">{user?.name}</div>
              <div className="text-xs text-primary-400 capitalize">{user?.role}</div>
            </div>
          </a>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col py-4 px-3 bg-sidebar transform lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="text-primary-300 font-bold text-lg">Hotel MS</span>
          <button onClick={onClose} className="text-primary-200 hover:text-white">
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
                    ? 'bg-primary-300 text-primary-900'
                    : 'text-primary-200 opacity-70 hover:opacity-100 hover:bg-primary-800'
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
          className="flex items-center gap-3 px-3 py-2 mt-4 rounded-xl text-primary-200 hover:bg-primary-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary-300 flex items-center justify-center text-primary-900 text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-primary-100">{user?.name}</div>
            <div className="text-xs text-primary-300 capitalize">{user?.role}</div>
          </div>
        </a>
      </div>
    </>
  );
};

export default Sidebar;
```

- [ ] **Step 2: Verify both themes on the sidebar**

```bash
cd hotel-management-fe && npm run dev
```

Amber theme: sidebar is dark brown, gold logo, amber nav items — identical to before.

In DevTools console: `document.documentElement.classList.add('theme-blue')` → sidebar switches to navy, blue logo icon background, blue nav tones. Remove the class to revert.

- [ ] **Step 3: Commit**

```bash
git add hotel-management-fe/src/components/layout/Sidebar.jsx
git commit -m "feat: update Sidebar to use theme-aware primary and sidebar color tokens"
```

---

### Task 7: Add Appearance section to `SettingsPage.jsx`

**Files:**
- Modify: `hotel-management-fe/src/components/pages/settings/SettingsPage.jsx`

- [ ] **Step 1: Add `useTheme` import**

After the existing imports (line 7, after `import Modal from '../../common/Modal';`), add:

```js
import { useTheme } from '../../../context/ThemeContext';
```

- [ ] **Step 2: Add `useTheme` call inside the component**

After `const { user } = useAuth();` (line 9), add:

```js
const { theme, setTheme } = useTheme();
```

- [ ] **Step 3: Insert the Appearance card in the JSX**

Directly before the `{/* Room Types List */}` comment, insert:

```jsx
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
```

Note: The swatch labels use hardcoded `text-amber-700`/`text-blue-700` intentionally — they always show the color they represent regardless of active theme.

- [ ] **Step 4: End-to-end test of the toggle**

```bash
cd hotel-management-fe && npm run dev
```

Log in as admin, go to Settings.

1. Appearance card shows "Warm Amber" swatch with ring highlight
2. Click "Light Blue" → entire UI (sidebar, background, cards, tables, forms) switches to blue instantly
3. Reload → blue persists (stored in `localStorage`)
4. Click "Warm Amber" → switches back
5. Reload → amber persists

- [ ] **Step 5: Commit**

```bash
git add hotel-management-fe/src/components/pages/settings/SettingsPage.jsx
git commit -m "feat: add Appearance theme swatch picker to Settings page"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full page audit in amber**

```bash
cd hotel-management-fe && npm run dev
```

Visit every page: Dashboard, Bookings, Rooms, Guests, Food Menu, Reports, Settings, Profile. All should be visually identical to the pre-theme-system design.

- [ ] **Step 2: Full page audit in blue**

In DevTools console: `localStorage.setItem('hms-theme','blue'); location.reload()`

Visit every page again. Check: sidebar is navy, backgrounds are light blue-tinted, cards have blue borders, table headers are blue, form inputs have blue focus rings, skeleton `.bone` shimmers in blue tones, modal headers are blue-tinted.

- [ ] **Step 3: Test env var default for blue**

```bash
REACT_APP_THEME=blue npm run dev
```

Clear `localStorage` first: `localStorage.removeItem('hms-theme'); location.reload()`. App should load in blue (env default), with no flash.

- [ ] **Step 4: Production build**

```bash
cd hotel-management-fe && npm run build
```

Expected: exits 0, `dist/` directory populated.
