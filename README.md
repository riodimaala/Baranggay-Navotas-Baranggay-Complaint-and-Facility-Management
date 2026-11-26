# Task 1.1.1 - Submit facility reservation request

## 1. Database (MySQL / XAMPP)
1. Buksan ang XAMPP, i-start ang **Apache** at **MySQL**.
2. Buksan ang phpMyAdmin (http://localhost/phpmyadmin) -> **Import** -> piliin ang `system-backend/database/schema.sql` -> **Go**.
   Gagawa ito ng database na `barangay_db` na may tables `facilities` at `reservations` at 4 na sample facility.

## 2. Backend
```bash
cd system-backend
npm install
cp .env.example .env     # palitan ang DB_PASSWORD kung may password ang MySQL mo
npm start                # http://localhost:3000
```

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/facilities | Listahan para sa dropdown |
| POST | /api/reservations | 1.1.1 Submit request |
| GET | /api/reservations | Mga request at status |

POST body: `resident_name, contact_number, facility_id, date (YYYY-MM-DD), start_time (HH:MM), end_time (HH:MM), purpose`.
`201` = saved as `pending`. `400` invalid/missing, `404` walang facility, `409` may approved na booking sa oras na iyon.

## 3. Frontend
Kopyahin sa `system-frontend/src/`:
- `services/reservationApi.js`
- `components/portal/ReservationRequestForm.jsx`

Gamitin sa page: `<ReservationRequestForm />`. Kung iba ang port ng backend, gumawa ng `.env` sa frontend: `VITE_API_URL=http://localhost:3000/api`.
