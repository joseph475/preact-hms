# Theme System Design

**Date:** 2026-04-13  
**Status:** Approved

---

## Context

The HMS frontend currently uses a hardcoded amber color palette throughout — in CSS component classes in `index.css`, direct Tailwind utility classes in JSX files, and one hardcoded hex inline style on the sidebar (`#7c2d12`). There is no theming abstraction.

The goal is to add a second **Light Blue** theme (navy sidebar, blue-500 primary, blue-50 background) while keeping amber as the default. The active theme is controlled by a Vercel env var (`REACT_APP_THEME`) for deployment-level defaults, and can also be toggled at runtime from Settings (persisted to `localStorage`).

---

## Approach: CSS Variables + Tailwind Semantic Tokens

### 1. CSS Variable Token Blocks — `src/styles/index.css`

Two theme blocks applied via a class on `<html>`:

```css
:root.theme-amber {
  --color-sidebar-bg:           #7c2d12;
  --color-sidebar-text:         #fde68a;
  --color-sidebar-active-bg:    #fde68a;
  --color-sidebar-active-text:  #78350f;
  --color-sidebar-hover:        #92400e;

  --color-primary:              #f59e0b;
  --color-primary-dark:         #d97706;
  --color-primary-darker:       #b45309;
  --color-primary-light:        #fde68a;
  --color-primary-lighter:      #fef3c7;

  --color-bg-app:               #fdf8f3;
  --color-bg-card:              #ffffff;
  --color-bg-hover:             #fef3c7;

  --color-text-primary:         #78350f;
  --color-text-secondary:       #92400e;
  --color-text-muted:           #b45309;

  --color-border:               #fde68a;
  --color-border-light:         #fef3c7;

  --color-bone-start:           #fef3c7;
  --color-bone-end:             #fde68a;

  --color-focus-ring:           #f59e0b;
}

:root.theme-blue {
  --color-sidebar-bg:           #1e3a8a;
  --color-sidebar-text:         #bfdbfe;
  --color-sidebar-active-bg:    #3b82f6;
  --color-sidebar-active-text:  #ffffff;
  --color-sidebar-hover:        #1d4ed8;

  --color-primary:              #3b82f6;
  --color-primary-dark:         #2563eb;
  --color-primary-darker:       #1d4ed8;
  --color-primary-light:        #bfdbfe;
  --color-primary-lighter:      #eff6ff;

  --color-bg-app:               #f0f4ff;
  --color-bg-card:              #ffffff;
  --color-bg-hover:             #eff6ff;

  --color-text-primary:         #1e3a8a;
  --color-text-secondary:       #1d4ed8;
  --color-text-muted:           #2563eb;

  --color-border:               #bfdbfe;
  --color-border-light:         #eff6ff;

  --color-bone-start:           #dbeafe;
  --color-bone-end:             #bfdbfe;

  --color-focus-ring:           #3b82f6;
}
```

The `body` background and text color also use these vars.

---

### 2. Tailwind Config — `tailwind.config.js`

Extend the `colors` block with semantic names that reference CSS vars. Tailwind will generate utility classes (`bg-primary`, `text-sidebar`, `border-border`, etc.) usable in JSX.

```js
colors: {
  primary:          'var(--color-primary)',
  'primary-dark':   'var(--color-primary-dark)',
  'primary-light':  'var(--color-primary-light)',
  'primary-lighter':'var(--color-primary-lighter)',
  sidebar:          'var(--color-sidebar-bg)',
  'app-bg':         'var(--color-bg-app)',
  'card-bg':        'var(--color-bg-card)',
  'text-main':      'var(--color-text-primary)',
  'text-sub':       'var(--color-text-secondary)',
  'border-theme':   'var(--color-border)',
}
```

> Note: opacity modifiers (e.g. `bg-primary/50`) won't work with CSS var colors — avoid them for theme-aware colors.

---

### 3. `index.css` Component Classes Updated

All existing CSS component classes that reference amber colors switch to CSS vars:

Component classes in `index.css` use `@apply` with Tailwind — once the semantic tokens are added to `tailwind.config.js`, all of these update by switching from `@apply bg-amber-500` to `@apply bg-primary`, etc. Raw CSS properties (like gradients and box-shadows) use `var(--color-*)` directly.

| Class | Change |
|---|---|
| `.btn-primary` | `@apply bg-amber-500` → `@apply bg-primary` |
| `.sidebar-nav-item.active` | `@apply bg-amber-300 text-amber-900` → `@apply bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]` |
| `.bone` shimmer gradient | `#fef3c7 → #fde68a` → `var(--color-bone-start) → var(--color-bone-end)` |
| `.form-input` focus ring | `ring-amber-400` → `ring-[var(--color-focus-ring)]` |
| `.badge-primary` | amber `@apply` → primary `@apply` |
| `body` background | `#fdf8f3` → `var(--color-bg-app)` |
| `.custom-scrollbar` thumb | amber → `var(--color-primary)` |
| `.stats-card` borders | amber → `var(--color-border)` |

---

### 4. JSX Files — Direct Inline Class Updates

Files with direct `bg-amber-*` / `text-amber-*` / `border-amber-*` Tailwind classes or hardcoded hex styles need updating:

- **`src/components/layout/Sidebar.jsx`** — hardcoded `style={{ backgroundColor: '#7c2d12' }}` → replaced with CSS var class; all `text-amber-*`, `bg-amber-*`, `hover:bg-amber-*` classes → semantic equivalents
- **Stat card icon colors** in DashboardPage and other pages — `iconBg="bg-amber-500"` stays as-is (this is an intentional accent, not a theme token; status colors like green/purple/teal remain neutral)
- Any other direct amber utility classes found during implementation

---

### 5. ThemeProvider — `src/context/ThemeContext.jsx` (new file)

```jsx
const STORAGE_KEY = 'hms-theme';
const VALID_THEMES = ['amber', 'blue'];
const DEFAULT_THEME = VALID_THEMES.includes(process.env.REACT_APP_THEME)
  ? process.env.REACT_APP_THEME
  : 'amber';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : DEFAULT_THEME;
  });

  useEffect(() => {
    const root = document.documentElement;
    VALID_THEMES.forEach(t => root.classList.remove(`theme-${t}`));
    root.classList.add(`theme-${theme}`);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- Wrapped around `<App>` in `src/index.js`
- `localStorage` overrides env var default (user preference wins)
- `REACT_APP_THEME` sets the deployment default (e.g. `blue` on a branded deployment)

---

### 6. `webpack.config.js` — DefinePlugin

Add `REACT_APP_THEME` alongside the existing env vars:

```js
'process.env.REACT_APP_THEME': JSON.stringify(process.env.REACT_APP_THEME || 'amber'),
```

---

### 7. Settings Page — Appearance Section

A new **Appearance** card in `SettingsPage.jsx` (inside the existing modal-based settings layout) with **split-circle color swatches** (chosen style):

- Two swatches: one showing `#7c2d12 / #f59e0b` (amber), one showing `#1e3a8a / #3b82f6` (blue)
- Active swatch has a ring highlight
- Labels: "Warm Amber" / "Light Blue"
- Calls `setTheme()` from `useTheme()` on click

---

## Files Changed

| File | Change |
|---|---|
| `src/styles/index.css` | Add theme variable blocks; update all component classes to use vars |
| `tailwind.config.js` | Extend colors with semantic CSS var tokens |
| `src/context/ThemeContext.jsx` | New file — ThemeProvider + useTheme hook |
| `src/index.js` | Wrap app in `<ThemeProvider>` |
| `webpack.config.js` | Add `REACT_APP_THEME` to DefinePlugin |
| `src/components/layout/Sidebar.jsx` | Replace hardcoded amber classes + inline style |
| `src/components/pages/settings/SettingsPage.jsx` | Add Appearance section with swatch picker |
| Any JSX with direct amber utilities | Replace with semantic classes (found during implementation) |

---

## Verification

1. **Default amber theme** — run `npm run dev`, app loads with amber theme (no env var set)
2. **Blue theme via env** — set `REACT_APP_THEME=blue` before build/dev, reload → blue theme loads
3. **Runtime toggle** — open Settings, click Blue swatch → entire UI switches to blue. Reload page → blue persists (localStorage). Click Amber → switches back.
4. **localStorage overrides env** — set `REACT_APP_THEME=blue`, manually set `localStorage.setItem('hms-theme', 'amber')`, reload → amber wins
5. **All pages** — navigate through Dashboard, Bookings, Rooms, Guests, Reports — all pages themed consistently
6. **Skeleton screens** — `.bone` shimmer should use blue tones in blue theme
7. **Sidebar** — sidebar background, active nav, hover states all theme-aware
