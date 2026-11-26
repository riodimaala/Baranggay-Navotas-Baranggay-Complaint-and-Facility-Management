import { api } from "./api";
import { shortDate, t12, stampLabel } from "../utils/format";

// Backend reservation -> the row shape the admin pages already use.
export const toRow = (r) => ({
  id: r.id,
  ref: r.reference,
  who: r.resident.name,
  contact: r.resident.contactNumber,
  fac: r.facilityName,
  when: `${shortDate(r.date)} · ${t12(r.startTime)}–${t12(r.endTime)}`,
  purpose: r.purpose,
  status: r.status,
  sched: stampLabel(r.scheduledFor),
  rejectReason: r.rejectReason,
});

export const listReservations = async () => (await api("/admin/reservations")).map(toRow);

// 1.1.2 Approve or reject a reservation request
export const approveReservation = (id) => api(`/admin/reservations/${id}/approve`, { method: "PATCH" });
export const rejectReservation = (id, reason) => api(`/admin/reservations/${id}/reject`, { method: "PATCH", json: { reason } });
