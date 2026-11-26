# 1.1.2 Approve or reject reservation requests

Connects the **admin portal to the real backend and database**, then makes the admin Reservations page work with real data.
This PR also holds the shared connection pieces (login, API client), because nothing else can talk to the backend without a login token.
**Merge this PR first.** The other PRs build on it.

## What changed
**Shared connection (used by every later task)**
- `services/api.js`: one place that calls the backend, adds the login token, and turns errors into readable messages.
- `services/auth.js` + `LoginView.jsx`: real login (the demo login was removed). Shows the backend's message for wrong password, wrong role, pending or rejected accounts.
- `RequireRole.jsx` + `App.jsx`: /admin, /resident and /tanod only open for the matching logged-in role. An expired login goes back to /login.
- `PortalLayout.jsx`: Log out now also clears the saved login.
- `utils/format.js`: `stampLabel()` helper for date-time text from the backend.

**1.1.2 Approve / reject**
- `services/adminReservations.js`: list, approve, reject.
- `AdminPortal.jsx`: reservations now come from the database.
- `Reservations.jsx`: Approve and Reject (with reason) call the backend, then reload the table. A clear message shows if the backend is down or the request was already handled.

**Fixes / testing helpers**
- `system-backend/.env.example`: `DB_NAME` was `barangay_db` but `schema.sql` creates `baranggay_db`, so a copied `.env` gave "Unknown database". Now they match.
- `system-frontend/.env.example`: `VITE_API_URL` (only needed if the backend is not on port 5000).
- `database/sample_reservations.sql`: 3 pending requests for testing only.

## How to test
1. Start MySQL (XAMPP). Import `system-backend/database/schema.sql`, then `sample_reservations.sql`.
2. Backend: copy `.env.example` to `.env`, then `npm install` and `npm start` (port 5000).
3. Frontend: `npm install` and `npm run dev`.
4. Log in as Admin: `admin@barangay.local` / `Admin@123`. Open **Reservations**.
5. Approve one and reject another. The status changes, a toast appears, and phpMyAdmin shows the new `status` in the `reservations` table.

## Not part of this PR (still sample data)
Resident forms, registration, tanod portal, and the admin Accounts, Reports, Notify and Analytics pages.
