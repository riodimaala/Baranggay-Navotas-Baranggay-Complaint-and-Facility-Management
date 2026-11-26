import { useRef, useState } from "react";
import PortalLayout from "../../components/portal/PortalLayout";
import { INITIAL_REQS, INITIAL_NOTES } from "../../data/residentData";
import { today, refNo } from "../../utils/format";

// Holds the resident's data and shares it with all resident pages.
// To connect to the backend, replace these functions with API calls.
export default function ResidentPortal() {
  const [reqs, setReqs] = useState(INITIAL_REQS);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const counters = useRef({ rsv: 2, cmp: 1 });
  const unread = notes.filter((n) => n.u).length;

  const addReservation = ({ facility, dateLabel, timeLabel }) => {
    const ref = refNo("RSV", ++counters.current.rsv);
    setReqs((l) => [{ ref, type: "Reservation", what: `${facility} · ${dateLabel}, ${timeLabel}`, date: today(), status: "Pending" }, ...l]);
    setNotes((n) => [{ t: "Request submitted", d: `${facility} on ${dateLabel} is waiting for approval (${ref}).`, w: "Just now", u: true }, ...n]);
    return ref;
  };

  const addComplaint = ({ category, house }) => {
    const ref = refNo("CMP", ++counters.current.cmp);
    setReqs((l) => [{ ref, type: "Complaint", what: `${category} · House no. ${house}`, date: today(), status: "Pending" }, ...l]);
    setNotes((n) => [{ t: "Complaint received", d: `${ref} was sent to the barangay for evaluation.`, w: "Just now", u: true }, ...n]);
    return ref;
  };

  const readNote = (i) => setNotes((n) => n.map((x, j) => (j === i ? { ...x, u: false } : x)));
  const readAll = () => setNotes((n) => n.map((x) => ({ ...x, u: false })));

  const links = [
    { to: "/resident", label: "Dashboard", end: true },
    { to: "/resident/reserve", label: "Reserve" },
    { to: "/resident/pickups", label: "Pick-up" },
    { to: "/resident/complaint", label: "Complaint" },
    { to: "/resident/notifications", label: "Notifications", badge: unread },
    { to: "/resident/history", label: "History" },
  ];

  return (
    <PortalLayout
      brand={{ icon: "🏠", text: "Resident Portal" }}
      links={links}
      context={{ reqs, notes, unread, addReservation, addComplaint, readNote, readAll }}
    />
  );
}
