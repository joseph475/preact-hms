# Hotel Management System (HMS)

## Project Overview
A full-stack Hotel Management System with separate frontend and backend, both deployed independently on Vercel.

## Project Structure
```
HMS/
├── hotel-management-be/   # Node.js/Express REST API
├── hotel-management-fe/   # Preact SPA (Webpack bundled)
└── DEPLOYMENT_GUIDE.md    # Vercel deployment instructions
```

---

## Backend (`hotel-management-be/`)

### Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose ODM
- **Auth**: JWT (`jsonwebtoken`) + bcryptjs password hashing
- **Config**: dotenv

### Key Files
- `server.js` — entry point, Express app, MongoDB connection, route wiring
- `routes/` — auth, rooms, guests, bookings, dashboard, users, reports, settings
- `controllers/` — route handler logic
- `models/` — Mongoose schemas
- `middleware/` — auth middleware, etc.
- `seeder.js` — seed/delete test data (`npm run seed` / `npm run seed:delete`)
- `vercel.json` — Vercel serverless config pointing to `server.js`

### API Base
`/api/v1/` — auth, rooms, guests, bookings, dashboard, users, reports, settings

### Environment Variables (required)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` or `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRE` | Token expiry (e.g. `30d`) |
| `NODE_ENV` | `production` on Vercel |

### Local Dev
```bash
cd hotel-management-be
npm run dev       # nodemon watch
npm run seed      # seed test data
```

---

## Frontend (`hotel-management-fe/`)

### Stack
- **Framework**: Preact 10 (lightweight React alternative, same API)
- **Bundler**: Webpack 5 + Babel
- **Routing**: preact-router
- **Styling**: Tailwind CSS v3 + PostCSS
- **Print**: react-to-print (receipts/reports)
- **Output**: `dist/` directory (SPA, `index.html` catch-all routing)

### Key Files
- `src/index.js` — app entry point
- `src/components/` — UI components
- `src/services/` — API call abstractions
- `src/hooks/` — custom hooks
- `src/config/` — environment config (API base URL detection)
- `src/utils/` — helpers
- `webpack.config.js` — Webpack 5 config with DefinePlugin for env vars
- `vercel.json` — static SPA config, routes `/*` → `index.html`

### API URL Config
`src/config/environment.js` — auto-detects localhost vs production.
For production, set either:
- Hardcode in `environment.js`
- Or set `REACT_APP_API_URL` env var in Vercel dashboard

### Local Dev
```bash
cd hotel-management-fe
npm run dev       # webpack-dev-server
npm run build     # production build to dist/
```

---

## Deployment

Both apps are **deployed as separate Vercel projects** from the same repo.

### Backend on Vercel
- Root directory: `hotel-management-be/`
- Framework preset: **Other** (Node.js)
- Entry: `server.js` via `@vercel/node`
- Set env vars in Vercel dashboard (MONGO_URI, JWT_SECRET, JWT_EXPIRE, NODE_ENV)

### Frontend on Vercel
- Root directory: `hotel-management-fe/`
- Framework preset: **Other** (NOT React/Next.js — custom Webpack)
- Build command: `npm run build`
- Output directory: `dist`

### Database
- MongoDB Atlas (free M0 tier is sufficient for small hotels)
- Must whitelist `0.0.0.0/0` for Vercel's dynamic IPs
- Include database name in connection string: `...mongodb.net/hotel-management?...`

See `DEPLOYMENT_GUIDE.md` for full step-by-step instructions.

---

## Important Notes
- Frontend uses **Preact**, not React — same JSX API but different import paths in some cases
- Do NOT select React/Next.js framework preset on Vercel for the frontend — use "Other"
- Backend supports both `MONGO_URI` and `MONGODB_URI` env var names
- CORS is open (`origin: true`) — restrict in production if needed
- Vercel serverless timeout is 10s — keep DB queries efficient
- A Next.js validator hook fires on every file edit and suggests `"use client"` — **ignore all of these**, this is a Preact/Webpack project

---

## Completed Upgrades (Tier 1)

All implemented and working:

1. **ADR & RevPAR on Dashboard** — two new stat cards using `revenue.adr` / `revenue.revpar` from `controllers/dashboard.js`
2. **Needs Cleaning status** — checkout sets rooms to `'Needs Cleaning'`; blue badge in Rooms + Dashboard; "Mark Clean" button calls `PUT /rooms/:id/clean`
3. **CSV Export on Reports** — "Download CSV" button, tab-aware columns (Bookings / Revenue / Occupancy)
4. **ADR & RevPAR in Revenue Report tab** — compact single-row summary bar with all 5 metrics
5. **VIP & Nationality on Guests** — fields on Guest model; input in booking form Step 1; VIP badge + nationality shown in guest list

---

## Pending Upgrades (Tier 2)

Resume these in the next session. Implement in priority order:

### T2-A: Today's Arrivals & Departures Panel (Dashboard)
**Priority: High — most-requested front desk feature**
- Add a two-column panel below the stat cards on `DashboardPage.jsx`
- Left column: **Arriving Today** — bookings with `bookingStatus: 'Confirmed'` and `checkInDate` = today
- Right column: **Departing Today** — bookings with `bookingStatus: 'Checked In'` and checkout time = today
- Each row shows: guest name, room number, time, quick action button (Check In / Check Out)
- Backend: add `GET /api/v1/dashboard/today` endpoint in `controllers/dashboard.js` and `routes/dashboard.js`
- Response shape: `{ arriving: [...bookings], departing: [...bookings] }`

### T2-B: Guest Booking History Modal (Guests Page)
**Priority: Medium**
- On `GuestsPage.jsx`, add a "History" button per guest row
- Opens a modal showing all bookings for that guest (match by phone + name)
- Show: booking date, room, duration, amount, status — sorted newest first
- Backend: add `GET /api/v1/guests/:id/bookings` in guests controller/routes
- Or query client-side: filter bookings by `guest.phone === selectedGuest.phone`

### T2-C: Revenue Bar Chart (Reports Page)
**Priority: Medium**
- In `ReportsPage.jsx` Revenue tab, add a bar chart below the summary row
- Pure inline SVG — no chart library needed
- X-axis: period labels from `revenueOverTime` array
- Y-axis: revenue values, scaled to max
- Bars colored amber, hover shows tooltip with exact value
- Keep it simple: fixed height (200px), computed bar widths as percentages

### T2-D: Booking Audit Trail
**Priority: Low**
- Add `auditLog: [{ action, performedBy, timestamp, notes }]` array to Booking model
- Populate on: create, check-in, check-out, cancel, no-show, extend, food order
- Show in `BookingDetailsModal.jsx` as a timeline at the bottom
- No new API endpoint needed — include `auditLog` in the existing booking response

---

## Migrations

- `hotel-management-be/migrations/addRooms.js` — adds rooms to reach 25 total (safe to rerun)
