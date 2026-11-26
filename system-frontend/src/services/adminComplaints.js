import { api, apiBlobUrl } from "./api";

// Backend complaint -> the row shape the admin pages already use.
export const toRow = (c) => ({
  id: c.id,
  ref: c.reference,
  who: c.resident.name,
  house: c.house,
  cat: c.category,
  desc: c.description,
  status: c.status,
  tanod: c.tanod?.name || "",
  hasPhoto: c.hasPhoto,
  rejectReason: c.rejectReason,
});

export const listComplaints = async () => (await api("/admin/complaints")).map(toRow);

// [{ id, name, onDuty }] tanods that can be dispatched
export const listTanods = () => api("/admin/tanods");

// the resident's photo proof (needs the login token, so it is downloaded and shown from a temporary URL)
export const loadComplaintPhoto = (id) => apiBlobUrl(`/complaints/${id}/photo`);

// 2.1.2 Evaluate a complaint: dispatch a tanod, resolve it without one, or reject it with a reason
export const dispatchComplaint = (id, tanodId) => api(`/admin/complaints/${id}/dispatch`, { method: "PATCH", json: { tanodId } });
export const resolveComplaint = (id) => api(`/admin/complaints/${id}/resolve`, { method: "PATCH" });
export const rejectComplaint = (id, reason) => api(`/admin/complaints/${id}/reject`, { method: "PATCH", json: { reason } });
