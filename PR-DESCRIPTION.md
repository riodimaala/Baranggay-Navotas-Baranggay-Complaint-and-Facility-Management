# 2.1.2 Evaluate complaints (dispatch a tanod, resolve, or reject)

**Requires PR 1.1.2 to be merged first.** It does not depend on the pick-up PR, so the two can be merged in any order.

## What changed
- `services/adminComplaints.js`: list complaints, list tanods, load the photo proof, dispatch, resolve, reject.
- `AdminPortal.jsx`: complaints and the tanod list now come from the database.
- `Complaints.jsx`: **Evaluate** opens a pop-up with the resident's details and photo proof (downloaded with the login token). The admin can:
  - **Dispatch tanod**: pick a tanod (off-duty ones are marked). The tanod and the resident are notified by the backend.
  - **Resolve without tanod**
  - **Reject** with a reason (the resident is notified)
- If someone else already handled the complaint, a clear message shows and the table refreshes. A message shows if the backend is down.
- `database/sample_complaints.sql`: 3 pending complaints for testing only.

## How to test
1. Follow the setup steps in PR 1.1.2, then import `sample_complaints.sql`.
2. Log in as Admin > **Complaints** > **Evaluate** on each complaint and try dispatch, resolve and reject.
3. phpMyAdmin: `complaints.status`, `tanod_id` and `reject_reason` changed, and `notifications` has new rows for the resident and the tanod.

## Not part of this PR
The resident complaint form (2.1.1) and the tanod portal are still sample data. The photo proof appears for complaints filed through the API with a photo.
