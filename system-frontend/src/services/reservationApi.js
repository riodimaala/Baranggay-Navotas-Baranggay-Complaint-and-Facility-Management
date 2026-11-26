// API calls for facility reservation and pickup. Backend must be running (npm start in system-backend).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'May nangyaring mali. Subukan ulit.');
  return data;
}

export const getFacilities = () => request('/facilities');

// 1.1.1 Submit facility reservation request
export const submitReservation = (form) =>
  request('/reservations', {
    method: 'POST',
    body: JSON.stringify({ ...form, facility_id: Number(form.facility_id) }),
  });

// filters (optional): { status: 'approved', contact_number: '0917...' }
export const getReservations = (filters = {}) => {
  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  return request(`/reservations${query ? `?${query}` : ''}`);
};

// 1.2.1 Admin: set or update the pickup schedule of an approved reservation
export const setPickupSchedule = (reservationId, { pickup_date, pickup_time }) =>
  request(`/reservations/${reservationId}/pickup`, {
    method: 'PUT',
    body: JSON.stringify({ pickup_date, pickup_time }),
  });

// 1.2.1 Admin: status is 'prepared' or 'released'
export const updatePickupStatus = (reservationId, status, remarks) =>
  request(`/reservations/${reservationId}/pickup/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, remarks }),
  });
