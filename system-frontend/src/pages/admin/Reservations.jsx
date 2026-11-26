import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Tabs from "../../components/portal/Tabs";
import DataTable from "../../components/portal/DataTable";
import Pill from "../../components/portal/Pill";
import Bt from "../../components/portal/Bt";
import Modal from "../../components/portal/Modal";
import ReasonModal from "../../components/portal/ReasonModal";
import { useToast } from "../../hooks/useToast";
import { RESERVATION_GROUPS } from "../../data/adminData";
import { minDate } from "../../utils/format";
import { approveReservation, rejectReservation, scheduleReservation, markPickedUp } from "../../services/adminReservations";

const REASONS = ["The facility is already booked", "The date is not available", "Incomplete details", "Other"];

// 1.2.1: the admin picks the pick-up date and time of an approved reservation
function ScheduleModal({ reservation, onClose, onSave }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!date || !time) { setError("Choose the pick-up date and time."); return; }
    setSaving(true);
    try {
      await onSave({ date, time });
    } catch (e) {
      setError(e.errors?.date || e.errors?.time || e.message); // message from the backend, e.g. "The pick-up date cannot be in the past."
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3>Schedule pick-up</h3>
      <p className="sub">{reservation.fac} for {reservation.who}</p>
      <div className="row2">
        <div><label htmlFor="sd">Pick-up date</label><input id="sd" type="date" min={minDate()} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label htmlFor="stm">Time</label><input id="stm" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
      </div>
      {error && <div className="err" role="alert">{error}</div>}
      <div className="acts" style={{ justifyContent: "flex-end", marginTop: 18 }}>
        <button className="bt ghost" onClick={onClose}>Cancel</button>
        <button className="bt" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save schedule"}</button>
      </div>
    </Modal>
  );
}

export default function Reservations() {
  const { rsv, rsvError, reloadRsv } = useOutletContext();
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // { type: "reject" | "schedule", id }
  const [busy, setBusy] = useState(false);

  // always show the latest requests when this page opens
  useEffect(() => {
    reloadRsv();
  }, [reloadRsv]);

  const list = rsv.filter((r) => filter === "all" || RESERVATION_GROUPS[filter].includes(r.status));
  const current = modal && rsv.find((r) => r.id === modal.id);

  // runs one backend action, then reloads so the table shows what is really in the database
  const run = async (action, title, text) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      toast(title, text);
    } catch (e) {
      toast("Action failed", e.message);
    } finally {
      await reloadRsv();
      setBusy(false);
    }
  };

  const approve = (r) => run(() => approveReservation(r.id), "Reservation approved", r.ref + " · the resident was notified");
  const reject = (reason) => {
    const r = current;
    setModal(null);
    run(() => rejectReservation(r.id, reason), "Reservation rejected", r.ref + " · the resident was notified");
  };

  // saves the pick-up schedule; errors go back to the pop-up so the admin can fix the date
  const schedule = async (sched) => {
    const r = current;
    await scheduleReservation(r.id, sched);
    setModal(null);
    toast("Pick-up scheduled", `${r.ref} · ${sched.date} ${sched.time}`);
    await reloadRsv();
  };

  const actions = (r) => ({
    // 1.1.2: a pending request can be approved or rejected
    Pending: (<>
      <Bt kind="okb" onClick={() => approve(r)}>Approve</Bt>
      <Bt kind="no" onClick={() => setModal({ type: "reject", id: r.id })}>Reject</Bt>
    </>),
    // 1.2.1: approved -> schedule the pick-up -> mark it picked up
    Approved: <Bt onClick={() => setModal({ type: "schedule", id: r.id })}>Schedule pick-up</Bt>,
    Scheduled: <Bt onClick={() => run(() => markPickedUp(r.id), "Marked as picked up", r.ref)}>Mark picked up</Bt>,
  })[r.status];

  return (
    <section className="view">
      <div className="box">
        <h2 style={{ fontSize: "1.4rem", marginBottom: 6 }}>🏟️ Facility Reservations</h2>
        <p className="sub" style={{ marginBottom: 14 }}>Approve or reject requests, then schedule the pick-up.</p>
        {rsvError && (
          <div className="err" role="alert" style={{ marginBottom: 12 }}>
            {rsvError} <button className="lnk" onClick={reloadRsv}>Try again</button>
          </div>
        )}
        <Tabs tabs={[["all", "All"], ["Pending", "Pending"], ["Active", "Active"], ["Done", "Done"]]} value={filter} onChange={setFilter} />
        {list.length ? (
          <DataTable heads={["Reference", "Resident", "Facility", "When", "Purpose", "Pick-up", "Status", ""]}>
            {list.map((r) => (
              <tr key={r.id}>
                <td>{r.ref}</td><td>{r.who}</td><td>{r.fac}</td><td>{r.when}</td><td>{r.purpose}</td>
                <td>{r.sched || "—"}</td><td><Pill status={r.status} /></td>
                <td><div className="acts">{actions(r)}</div></td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <div className="tw"><div className="empty">{rsvError ? "Could not load reservations." : "Nothing here."}</div></div>
        )}
      </div>

      {modal?.type === "reject" && current && (
        <ReasonModal title="Reject reservation" options={REASONS} onClose={() => setModal(null)} onConfirm={reject} />
      )}
      {modal?.type === "schedule" && current && (
        <ScheduleModal reservation={current} onClose={() => setModal(null)} onSave={schedule} />
      )}
    </section>
  );
}
