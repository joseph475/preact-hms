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

## Per-Page Structural Improvements

All pages get amber palette + Plus Jakarta Sans via the global CSS rewrite. These are the additional layout/structure changes per page:

### Rooms (`RoomsPage.jsx`)
- **Card view redesign**: room number (large, bold) + type badge + floor label + status badge. No pricing shown on the card — rates appear only in the booking flow and details modal.
- Status badge colors: green = Available, amber = Occupied, red = Maintenance / Out of Order
- **Table view**: hide Description and Telephone columns by default (too many columns); show them in an expandable row on click
- Actions on card: "Book" (primary, amber) + "Details" + "Edit"

### Bookings (`BookingsPage.jsx`)
- **Booking cards**: guest avatar circle + name, room number + duration on one line, status badge prominent, primary action button (Check In / Check Out) highlighted
- **Multi-step modal**: add a clear numbered step indicator at the top (① Guest Info → ② Room → ③ Details) with done/active/pending states
- **Status filter pills** above the list (Active / All / Checked Out / Cancelled) replacing the dropdown

### Food Menu (`FoodMenuPage.jsx`)
- **Category tabs** restyled as amber pill tabs with item count badge per category (e.g. "Breakfast 4")
- **Item cards**: item name, category badge, price prominent, availability shown as a toggle switch (on/off style)
- Unavailable items shown at reduced opacity

### Reports (`ReportsPage.jsx`)
- **All 3 tabs fully implemented**: Bookings, Revenue, Occupancy (Revenue and Occupancy tabs currently render no content)
- **Summary stats as cards** at the top of each tab (Total Bookings, Total Revenue, Avg/Booking on Bookings tab; Occupancy rate, Available/Occupied counts on Occupancy tab)
- Revenue tab: stat cards + breakdown table by room type
- Occupancy tab: visual occupancy percentage bar + breakdown table by room type

### Users (`UsersPage.jsx`)
- **Table row**: avatar circle + name/email stacked in one column (saves horizontal space)
- Role badges: Admin = amber filled, Staff = amber outline
- Status badge: Active = green, Inactive = gray
- Inline filter pills above the table (Role / Status) instead of hidden dropdown

### Settings (`SettingsPage.jsx`)
- **Layout change**: full-width form stacked above full-width list (removes cramped 2-col split on medium screens)
- Pricing fields in a clean labeled 2×2 grid (3 hrs / 8 hrs / 12 hrs / 24 hrs)
- Room type list cards show all 4 tiers + capacity + penalty in an organized grid

### Profile (`ProfilePage.jsx`)
- **Full implementation** (currently a placeholder):
  - Top section: large avatar circle with initials, name, email, role badge
  - Bottom section: edit form with name field + password change (current → new → confirm)
  - Save button triggers the existing update-user API

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
| `src/components/pages/dashboard/DashboardPage.jsx` | Room grid with type + status chips |
| `src/components/pages/rooms/RoomsPage.jsx` | Card redesign (no rates), table column hiding |
| `src/components/pages/bookings/BookingsPage.jsx` | Card redesign, step indicator, status filter pills |
| `src/components/pages/guests/GuestsPage.jsx` | Add search bar + filtering logic |
| `src/components/pages/food/FoodMenuPage.jsx` | Pill tabs with counts, card + toggle redesign |
| `src/components/pages/reports/ReportsPage.jsx` | Implement Revenue + Occupancy tabs, stats cards |
| `src/components/pages/users/UsersPage.jsx` | Stacked name/email column, filter pills |
| `src/components/pages/settings/SettingsPage.jsx` | Stacked layout, pricing grid |
| `src/components/pages/profile/ProfilePage.jsx` | Full implementation with edit form |

---

## Verification

1. Run `npm run dev` in `hotel-management-fe/` — app loads with warm amber theme
2. Sidebar shows icons only, tooltips appear on hover, active page highlighted in amber
3. All pages reflect amber palette (no leftover blue-600 classes for primary actions)
4. Guests page: typing in search filters the list in real-time, result count updates, clear button works
5. Dashboard room grid shows room number + type label; occupied vs available chips are visually distinct
6. Rooms page: cards show no pricing; status badges are color-coded; table hides description/telephone columns
7. Bookings page: step indicator shows in modal; status pills work above the list
8. Food menu: category tabs show item counts; availability toggle visible on each card
9. Reports: all 3 tabs load content; each tab shows summary stat cards
10. Profile: edit form saves name and password changes
11. Mobile: sidebar hamburger still works, slides in full-width overlay
12. Print (receipts): no visual regression — `.no-print` classes still function
