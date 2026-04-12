# Booking Details Modal Redesign

**Date:** 2026-04-12  
**Status:** Approved  
**File:** `hotel-management-fe/src/components/pages/bookings/components/BookingDetailsModal.jsx`

---

## Problem

The current booking details modal is a single long-scrolling page with 9 sections. It overwhelms staff with too much information at once, has inconsistent visual styling, and no clear hierarchy — making it slow to scan during a busy front desk shift.

## Goals

- Surface room + timing information immediately (the #1 front-desk need)
- Reduce visual noise by organizing content into tabs
- Simplify the layout without removing meaningful data
- Stay consistent with the app's amber color scheme

---

## Design

### Structure: Tabbed Modal (3 tabs)

Replace the 9-section scroll with a compact tabbed layout.

**Header (always visible)**
- Amber gradient background (`from-amber-400 to-amber-600`)
- Booking number (small, muted)
- Room number + room type (large, bold — most prominent element)
- Check-in → Check-out datetime range (one line)
- Status badge (white/translucent pill)

**Tab 1 — Overview** (default tab)
- 2×2 grid: Room number + type + guest count / Guest name + phone
- 2×2 grid: ID type + number / Payment status + total
- Summary pill: total stay duration (e.g. "22 hours")

**Tab 2 — Timing**
- Check-in row: scheduled time + actual time (if recorded)
- Check-out row: scheduled time + actual time (if recorded)
- Extension entries (if any): hours added, new checkout time, charge amount

**Tab 3 — Payment**
- Line items: base rate, extension charges (if any)
- Payment method
- Amount paid (highlighted green)
- Total amount (large, bold)
- Special requests / notes box (if present)

### Removed

- Booking metadata section (Created By, Created At, Updated At) — cut entirely
- Status badge duplication (was in header AND metadata — now header only)

### Visual Style

- **Header:** `bg-gradient-to-r from-amber-400 to-amber-600` with white text
- **Tab bar:** `bg-amber-50` background, active tab has white background + amber underline border
- **Labels:** `text-amber-600` uppercase, small, letter-spaced
- **Values:** `text-stone-900` bold
- **Summary pill:** `bg-amber-50 border border-amber-200 text-amber-900`
- **Timing dots:** green for check-in, amber for check-out
- **Extension items:** `bg-amber-50 border border-amber-200`
- **Notes box:** `bg-amber-50 border border-amber-200`
- **Footer:** `bg-amber-50 border-t border-amber-100` with Close button

---

## Files to Modify

| File | Change |
|------|--------|
| `hotel-management-fe/src/components/pages/bookings/components/BookingDetailsModal.jsx` | Full rewrite of JSX structure — replace 9-section scroll with tabbed layout |

No backend changes required. All data is already available in the `bookingToViewDetails` prop passed from `BookingsPage.jsx`.

---

## Data Fields Used (from existing booking object)

| Field | Used In |
|-------|---------|
| `bookingNumber` / `_id` | Header |
| `room.roomNumber`, `room.type` | Header, Overview |
| `checkInDate`, `checkOutDate` | Header, Timing |
| `actualCheckIn`, `actualCheckOut` | Timing |
| `bookingStatus` | Header badge |
| `guest.firstName`, `guest.lastName` | Overview |
| `guest.phone` | Overview |
| `guest.idType`, `guest.idNumber` | Overview |
| `paymentStatus`, `paymentMethod` | Overview, Payment |
| `totalAmount`, `paidAmount` | Overview, Payment |
| `extensionCharges[]` | Timing, Payment |
| `specialRequests`, `notes` | Payment |
| `numberOfGuests` | Overview |

Helper functions already available in `BookingsPage.jsx`:
- `getStatusBadge(status)` — returns badge JSX
- `getPaymentBadge(status)` — returns badge JSX  
- `formatDateTime(date)` — formats datetime string
- `calculateCheckOutTime(checkIn, duration)` — computes scheduled checkout

---

## Verification

1. Open the Bookings page and click the eye icon on any booking
2. Confirm the modal opens with the amber gradient header showing room + dates
3. Verify the Overview tab shows by default with the 2×2 grid
4. Click Timing tab — confirm check-in/out rows and extensions (if any) render
5. Click Payment tab — confirm line items, paid amount in green, and total
6. Confirm bookings with no extensions don't show an extension section in Timing
7. Confirm bookings with no special requests don't show a notes box in Payment
8. Confirm no metadata section (Created By / Created At) appears anywhere
9. Close button works
