import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Tabs from "../../components/portal/Tabs";
import DataTable from "../../components/portal/DataTable";
import Pill from "../../components/portal/Pill";
import Bt from "../../components/portal/Bt";
import ReasonModal from "../../components/portal/ReasonModal";
import { useToast } from "../../hooks/useToast";
import { RESERVATION_GROUPS } from "../../data/adminData";
import { approveReservation, rejectReservation } from "../../services/adminReservations";

const REASONS = ["The facility is already booked", "The date is not available", "Incomplete details", "Other"];

export default function Reservations() {
  const { rsv, rsvError, reloadRsv } = useOutletContext();
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // { type: "reject", id }
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

  // 1.1.2: a pending request can be approved or rejected
  const actions = (r) => ({
    Pending: (<>
      <Bt kind="okb" onClick={() => approve(r)}>Approve</Bt>
      <Bt kind="no" onClick={() => setModal({ type: "reject", id: r.id })}>Reject</Bt>
    </>),
  })[r.status];

  return (
    <section className="view">
      <div className="box">
        <h2 style={{ fontSize: "1.4rem", marginBottom: 6 }}>🏟️ Facility Reservations</h2>
        <p className="sub" style={{ marginBottom: 14 }}>Approve or reject the requests from residents.</p>
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
    </section>
  );
}
