# HMS Major Redesign — Design Spec

**Date:** 2026-04-11  
**Status:** Approved  
**Scope:** Full frontend visual overhaul + Guests page search functionality

---

## Context

The current HMS frontend uses a generic blue-primary Tailwind design (Roboto, white cards, slate-50 background). The goal is a cohesive boutique-hotel aesthetic that feels intentional and warm — not another generic SaaS admin panel. A search bar is also being added directly to the Guests page so staff can find guests by name, phone, or ID without using the global header search.

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Visual theme | Warm Boutique | Cream/amber/brown palette; feels hotel-appropriate |
| Navigation | Icon-only sidebar | More content space; modern; tooltips on hover |
| Typography | Plus Jakarta Sans (all weights) | Replaces Roboto; geometric, modern, pairs well with warm colors |
| Room grid | Number + type label | Staff shouldn't need to memorize room types |
| Guest search | Inline page-level search bar | Faster than using global header search for guest lookup |

---

## Color System

Replace the current blue-primary palette in `tailwind.config.js` and `index.css`:

| Token | Value | Usage |
|---|---|---|
| `background` | `#fdf8f3` | App/page background (replaces slate-50) |
| `sidebar` | `#7c2d12` | Sidebar background |
| `primary-900` | `#78350f` | Headings, strong text |
| `primary-800` | `#92400e` | Secondary text, labels |
| `primary-600` | `#d97706` | Primary action color (buttons, active states) |
| `primary-300` | `#fde68a` | Borders, highlights, hover fills |
| `primary-100` | `#fef3c7` | Card backgrounds, chip backgrounds |
| `primary-50` | `#fef9f0` | Input backgrounds, subtle fills |
| `surface` | `#ffffff` | Cards, modals, table backgrounds |

Semantic colors (success/danger/warning) remain green/red/yellow — only the primary palette changes.

---

## Typography

**Replace Roboto with Plus Jakarta Sans** in:
- `src/index.html` (Google Fonts link)
- `src/styles/index.css` (`@import` + `font-family` base)
- `tailwind.config.js` (`fontFamily.sans`)

Weights to import: 400, 500, 600, 700, 800.

---

## Layout — Icon Sidebar

Replace the current `w-64` wide sidebar with a `w-16` (64px) icon-only sidebar.

**Sidebar structure:**
- Logo mark at top (amber square, hotel emoji or monogram)
- Nav icons stacked vertically — each 40×40px, rounded-xl
- Active state: amber (`#fde68a`) background, brown icon
- Inactive state: 45% opacity, transparent background; hover adds subtle amber fill
- Tooltips on hover (using `title` attribute or a custom tooltip) showing page name
- Bottom section: Settings icon + user avatar (initials circle)
- No labels — icon-only

**Main content area** gets the full remaining width (was sharing with a 256px sidebar).

**Header** (`Header.jsx`):
- White background, `border-b border-amber-200`
- Left: current page title / greeting
- Center: global search bar (amber-bordered input)
- Right: notification bell icon button

---

## Global Component Changes (`src/styles/index.css`)

Update all component classes to use the new warm palette:

| Component | Key changes |
|---|---|
| `.btn-primary` | `bg-amber-600 hover:bg-amber-700` (replaces blue-600) |
| `.btn-secondary` | `bg-amber-100 text-amber-900 border-amber-200` |
| `.card` | `border border-amber-200` (replaces border-gray-100) |
| `.table-header` | `bg-amber-100` (replaces gray gradient) |
| `.badge-*` | Keep semantic colors (green/red/yellow); add `.badge-primary` in amber |
| `.sidebar-nav-item-active` | `bg-amber-200 text-amber-900` |
| `.form-input` | `border-amber-200 focus:ring-amber-500` |
| `.modal-overlay` | backdrop unchanged; modal border `border-amber-200` |
| `.page-container` | background `#fdf8f3` |

---

## Sidebar Component (`src/components/layout/Sidebar.jsx`)

Full rewrite:
- Width: `w-16` (64px), fixed height, flex column
- Background: `bg-[#7c2d12]`
- Logo area: amber rounded square at top
- Nav items: map over routes, render icon only, `title` attribute for tooltip
- Active detection: same as current (match current path)
- Bottom: settings + avatar
- Mobile: keep existing overlay/hamburger behavior, sidebar slides in full-width on mobile

Nav items and their icons:
| Page | Icon (Heroicon or emoji fallback) |
|---|---|
| Dashboard | HomeIcon |
| Rooms | BuildingOfficeIcon |
| Bookings | CalendarIcon |
| Guests | UsersIcon |
| Food Menu | ShoppingCartIcon |
| Reports | ChartBarIcon |
| Users (admin) | UserGroupIcon |
| Settings (admin) | CogIcon |

---

## Dashboard Page (`src/components/pages/dashboard/DashboardPage.jsx`)

- Stats row: 4 cards (Total Rooms, Occupancy %, Guests Today, Revenue)
- Room status grid: chips showing `roomNumber` + `room.roomType.name` (populated via the existing rooms API which uses `populate('roomType')`)
  - Amber filled = Occupied, amber-100 outlined = Available, dashed = Maintenance / Out of Order
- Recent bookings table: guest name, room, check-in, status badge
- All using updated `.card`, `.stats-card`, `.table-*` classes

---

## Guests Page (`src/components/pages/guests/GuestsPage.jsx`)

### Search feature (new)

Add a **page-level search bar** above the table, independent of the global header search:

```
[🔍 Search by name, phone, or ID...]  [All guests ▾]  [Filter ▾]
```

**Implementation:**
- Local state: `const [searchQuery, setSearchQuery] = useState('')`
- Filter the existing `guests` array client-side (already fetched):
  ```js
  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(q) ||
    g.phone.includes(q) ||
    g.idNumber?.toLowerCase().includes(q)
  )
  ```
- Debounce: 200ms using a simple `useEffect` + `setTimeout` (no extra dependency)
- Show result count: "Showing X of Y guests" below the search bar
- Clear button (×) appears when query is non-empty
- Search is client-side only — no new API calls needed since guests are already loaded

### Table updates
- Columns: Guest (avatar + name + notes indicator), Phone, ID/Passport, Registered, Actions
- "View" button per row (replaces notes-only red button)
- Pagination unchanged (15 per page), applied after filtering

---

## Other Pages

All other pages (Rooms, Bookings, Food Menu, Reports, Users, Settings) receive:
- Updated color classes (amber replaces blue throughout)
- New typography (Plus Jakarta Sans via CSS, no component changes needed)
- Updated `.card`, `.btn-*`, `.table-*`, `.badge-*` classes via the global CSS rewrite
- No structural/layout changes to these pages — the CSS overhaul carries the visual update

---

## Files to Modify

| File | Change |
|---|---|
| `src/index.html` | Replace Roboto with Plus Jakarta Sans Google Fonts link |
| `tailwind.config.js` | Replace primary color palette (blue → amber), update fontFamily |
| `src/styles/index.css` | Full palette + component class rewrite |
| `src/components/layout/Sidebar.jsx` | Rewrite as icon-only sidebar (w-16) |
| `src/components/layout/Header.jsx` | Update colors, layout tweaks |
| `src/components/App.jsx` | Update grid layout (sidebar width change) |
| `src/components/pages/dashboard/DashboardPage.jsx` | Room grid with type labels, updated card/table styles |
| `src/components/pages/guests/GuestsPage.jsx` | Add search bar + filtering logic |

---

## Verification

1. Run `npm run dev` in `hotel-management-fe/` — app loads with warm amber theme
2. Sidebar shows icons only, tooltips appear on hover, active page highlighted in amber
3. All pages reflect amber palette (no leftover blue-600 classes for primary actions)
4. Guests page: typing in search filters the list in real-time, result count updates, clear button works
5. Dashboard room grid shows room number + type label, occupied vs available chips are visually distinct
6. Mobile: sidebar hamburger still works, slides in full-width overlay
7. Print (receipts): no visual regression — `.no-print` classes still function
