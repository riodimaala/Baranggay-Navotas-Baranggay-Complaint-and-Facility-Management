# 1.2.1 Schedule facility pick-up and update pick-up status

**Requires PR 1.1.2 to be merged first.**

## What changed
**Admin (Reservations page)**
- Approved reservation: **Schedule pick-up** opens a pop-up for the pick-up date and time. Errors from the backend (for example a past date) are shown inside the pop-up.
- Scheduled reservation: **Mark picked up** updates the status.
- The resident is notified automatically when a pick-up is scheduled (done by the backend).
- `services/adminReservations.js`: `scheduleReservation`, `markPickedUp`.

**Resident**
- New page **Pick-up** (`/resident/pickups`) with a sidebar link: shows the resident's own reservations, the pick-up date and time, and the current status, plus a reminder box for scheduled pick-ups.
- `services/residentReservations.js`: loads `/reservations/mine`.
- `App.jsx`, `ResidentPortal.jsx`, `PortalLayout.jsx`: route, link and icon for the new page.

## How to test
1. Follow the setup steps in PR 1.1.2 and approve a reservation as Admin.
2. Admin > Reservations > **Schedule pick-up**, choose a date and time, save. The row becomes **Scheduled**.
3. Click **Mark picked up**. The row becomes **Picked up**.
4. Log in as Resident `juan@email.com` / `Resident@123` > **Pick-up** to see the schedule and status.
5. phpMyAdmin: `reservations.status` and `scheduled_at` changed.

## Not part of this PR
Return scheduling and marking as returned (1.2.2). A "Picked up" reservation has no admin buttons until that task.
