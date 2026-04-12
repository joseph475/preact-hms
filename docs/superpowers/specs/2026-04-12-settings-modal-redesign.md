# Settings Page Modal Redesign

**Date:** 2026-04-12  
**Status:** Approved

## Context

The current Settings page shows the Add/Edit Room Type form inline on the page at all times. This wastes vertical space and forces the user to scroll back to the top when editing a room type from the list. The redesign moves the form into a modal popup, keeping the page clean and consistent with how other forms work in the app (bookings, food orders, extend stay).

## Design

### Page Layout

- **Header row:** Left side shows "Settings" title + "Manage room types" subtitle. Right side has an amber gradient "Add Room Type" button (`bg-gradient-to-r from-amber-400 to-amber-600`) with a `+` icon.
- **Body:** Only the room types list is shown on the page (no inline form).
- **Room type rows:** Same card layout as current — name, capacity, penalty, pricing chips (3h/8h/12h/24h), edit + delete action buttons.
- **Pagination:** Unchanged.

### Modal

Reuses the existing `Modal.jsx` component (`hotel-management-fe/src/components/common/Modal.jsx`) with `size="default"` (max-w-2xl) and `showCloseButton={false}` — the close button is inside the custom header instead.

**Header** (matches `BookingDetailsModal` pattern exactly):
```jsx
<div className="-mx-6 -mt-4 bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-5 rounded-t-2xl">
  <button onClick={closeModal} className="... float close button top-right" />
  <div className="text-xs font-semibold text-amber-100 uppercase tracking-widest mb-1">Room Type</div>
  <div className="text-2xl font-extrabold text-white">
    {editingRoomType ? `Edit ${editingRoomType.name}` : 'Add Room Type'}
  </div>
</div>
```

**Body:** All existing form fields preserved — Name, Description, Base Capacity, Pricing (3h/8h/12h/24h), Penalty.

**Footer:** Cancel button + "Create Room Type" / "Update Room Type" save button (amber gradient).

### Behaviour

| Action | Trigger | Modal title | Save label |
|--------|---------|-------------|------------|
| Add | Click "Add Room Type" button | Add Room Type | Create Room Type |
| Edit | Click edit pencil on a row | Edit [name] | Update Room Type |
| Close | Cancel button or ✕ | — | — |

On successful save: modal closes, list refreshes, success toast shown on page.  
On error: error message shown inside the modal (not on the page).

## Files to Modify

- `hotel-management-fe/src/components/pages/settings/SettingsPage.jsx` — only file that changes.

## What Is Not Changing

- All API calls (`api.createRoomType`, `api.updateRoomType`, `api.deleteRoomType`, `api.getRoomTypes`) — unchanged.
- The room type list display, pricing chips, pagination — unchanged.
- Delete confirmation — still uses `confirm()` dialog, unchanged.
- `Modal.jsx` — used as-is, no modifications.

## Verification

1. Run `npm run dev` in `hotel-management-fe/`
2. Navigate to Settings page
3. Confirm: form is gone, only list + Add button visible
4. Click "Add Room Type" → modal opens with empty form, amber gradient header, title "Add Room Type"
5. Fill form, click "Create Room Type" → modal closes, new entry appears in list
6. Click edit pencil on a row → modal opens pre-filled, title says "Edit [name]", button says "Update Room Type"
7. Edit fields, click "Update Room Type" → modal closes, list reflects changes
8. Click Cancel or ✕ → modal closes with no changes
