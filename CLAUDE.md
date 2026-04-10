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
