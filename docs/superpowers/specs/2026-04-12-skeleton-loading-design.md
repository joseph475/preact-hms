# Skeleton Loading Design

**Date:** 2026-04-12  
**Status:** Approved

---

## Context

The HMS frontend currently shows a spinning circle (`.spinner` CSS class) while pages load data. This blocks the entire page view and provides no sense of the content structure that's about to appear. The goal is to replace all full-page spinners with per-page skeleton screens — amber-toned shimmer placeholders that mirror each page's real layout — giving users an immediate sense of structure while data loads.

Button-level spinners (e.g., the save button in the Users modal) are **not** replaced — those are action feedback, not page loading, and spinners are appropriate there.

---

## Decisions

| Question | Decision |
|---|---|
| Library (boneyard-js) vs handcrafted | Handcrafted — no CLI build step, no new dependency |
| Animation style | Shimmer (gradient sweep, 2s linear infinite) |
| Color theme | Amber tones (`#fef3c7` → `#fde68a`) to match HMS |
| Scope | All 8 pages with full-page spinners |
| Button spinners | Keep as-is |

---

## Architecture

### 1. CSS — add shimmer keyframe to `index.css`

Add to `hotel-management-fe/src/styles/index.css`:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.bone {
  background: linear-gradient(90deg, #fef3c7 30%, #fde68a 50%, #fef3c7 70%);
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
  border-radius: 6px;
}
```

### 2. Skeleton components — one per page

Create `hotel-management-fe/src/components/common/skeletons/` with 8 files:

| File | Mirrors layout of |
|---|---|
| `DashboardSkeleton.jsx` | 4 stat cards + 2-column arrivals/departures panel |
| `BookingsSkeleton.jsx` | Filter bar + 5-row table |
| `RoomsSkeleton.jsx` | Filter bar + 6-card grid |
| `GuestsSkeleton.jsx` | Filter bar + 5-row table |
| `UsersSkeleton.jsx` | Filter bar + 5-row table |
| `ReportsSkeleton.jsx` | 3 tab buttons + table content |
| `SettingsSkeleton.jsx` | Section header + 3 form rows |
| `FoodMenuSkeleton.jsx` | Filter bar + 3-card image grid |

Each component uses only `<div className="bone">` elements with inline width/height to approximate the real layout. No props needed — pure presentational.

### 3. Page updates — swap spinner for skeleton

In each of the 8 page components, replace:

```jsx
if (loading && items.length === 0) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner"></div>
    </div>
  );
}
```

With:

```jsx
import { PageNameSkeleton } from '../../common/skeletons/PageNameSkeleton';

// ...

if (loading && items.length === 0) {
  return <PageNameSkeleton />;
}
```

For `DashboardPage`, the check is just `if (loading)` (no items array), same replacement pattern.

---

## Files Modified

- `hotel-management-fe/src/styles/index.css` — add `.bone` class + `@keyframes shimmer`
- `hotel-management-fe/src/components/pages/dashboard/DashboardPage.jsx`
- `hotel-management-fe/src/components/pages/bookings/BookingsPage.jsx`
- `hotel-management-fe/src/components/pages/rooms/RoomsPage.jsx`
- `hotel-management-fe/src/components/pages/guests/GuestsPage.jsx`
- `hotel-management-fe/src/components/pages/users/UsersPage.jsx`
- `hotel-management-fe/src/components/pages/reports/ReportsPage.jsx`
- `hotel-management-fe/src/components/pages/settings/SettingsPage.jsx`
- `hotel-management-fe/src/components/pages/food-menu/FoodMenuPage.jsx`

## Files Created

- `hotel-management-fe/src/components/common/skeletons/DashboardSkeleton.jsx`
- `hotel-management-fe/src/components/common/skeletons/BookingsSkeleton.jsx`
- `hotel-management-fe/src/components/common/skeletons/RoomsSkeleton.jsx`
- `hotel-management-fe/src/components/common/skeletons/GuestsSkeleton.jsx`
- `hotel-management-fe/src/components/common/skeletons/UsersSkeleton.jsx`
- `hotel-management-fe/src/components/common/skeletons/ReportsSkeleton.jsx`
- `hotel-management-fe/src/components/common/skeletons/SettingsSkeleton.jsx`
- `hotel-management-fe/src/components/common/skeletons/FoodMenuSkeleton.jsx`

---

## Verification

1. `npm run dev` in `hotel-management-fe/`
2. Navigate to each page — skeleton should appear briefly before data loads
3. On slow connections (throttle in DevTools to Slow 3G), skeleton should be clearly visible for several seconds
4. After data loads, real content replaces skeleton cleanly (no flash)
5. Navigating back to a page with cached data should skip the skeleton entirely (existing `useSimpleCache` hook prevents re-fetch)
6. Button spinners in Users modal still work correctly
