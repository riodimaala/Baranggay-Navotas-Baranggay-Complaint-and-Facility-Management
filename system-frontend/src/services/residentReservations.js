import { api } from "./api";
import { shortDate, t12, stampLabel } from "../utils/format";

// Backend reservation -> the row the resident pages show.
export const toMine = (r) => ({
  id: r.id,
  ref: r.reference,
  fac: r.facilityName,
  when: `${shortDate(r.date)} · ${t12(r.startTime)}–${t12(r.endTime)}`,
  status: r.status,
  sched: stampLabel(r.scheduledFor), // pick-up date and time, "" if not scheduled yet
  rejectReason: r.rejectReason,
});

// the logged-in resident's own reservations
export const listMyReservations = async () => (await api("/reservations/mine")).map(toMine);
