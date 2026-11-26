import { useEffect, useState } from "react";
import DataTable from "../../components/portal/DataTable";
import Pill from "../../components/portal/Pill";
import { listMyReservations } from "../../services/residentReservations";

// what the resident should know about the pick-up, depending on the reservation status
const pickupInfo = (r) => {
  if (r.status === "Scheduled") return <><b>{r.sched}</b> · bring a valid ID</>;
  if (r.status === "Picked up") return "Picked up. Please return it on time.";
  if (r.status === "Returned") return "Returned. Thank you!";
  if (r.status === "Approved") return "Waiting for the barangay to set the pick-up schedule";
  if (r.status === "Rejected") return r.rejectReason ? "Rejected: " + r.rejectReason : "Rejected";
  return "—";
};

// 1.2.1 (resident side): the pick-up schedule and status of the resident's own reservations
export default function Pickups() {
  const [rows, setRows] = useState(null); // null = still loading
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);    // the Refresh button changes this to load again

  useEffect(() => {
    let alive = true;
    listMyReservations()
      .then((list) => { if (alive) { setRows(list); setError(""); } })
      .catch((e) => { if (alive) setError(e.message); });
    return () => { alive = false; };
  }, [tick]);

  const upcoming = (rows || []).filter((r) => r.status === "Scheduled");

  return (
    <section className="view" id="v-pick">
      <div className="box">
        <h2 style={{ fontSize: "1.4rem", marginBottom: 6 }}>📦 Pick-up Schedule</h2>
        <p className="sub" style={{ marginBottom: 14 }}>When to pick up the facility you reserved, and where each request stands.</p>

        {upcoming.map((r) => (
          <div className="tip" key={r.id} style={{ marginBottom: 10 }}>
            📦 Pick up {r.fac} on <b>{r.sched}</b>. Bring a valid ID.
          </div>
        ))}

        {error && (
          <div className="err" role="alert" style={{ marginBottom: 12 }}>
            {error} <button className="lnk" onClick={() => setTick((t) => t + 1)}>Try again</button>
          </div>
        )}

        {rows === null && !error && <div className="tw"><div className="empty">Loading…</div></div>}
        {rows && rows.length === 0 && <div className="tw"><div className="empty">You have no reservations yet.</div></div>}
        {rows && rows.length > 0 && (
          <DataTable heads={["Reference", "Facility", "Reserved for", "Status", "Pick-up"]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.ref}</td><td>{r.fac}</td><td>{r.when}</td><td><Pill status={r.status} /></td><td>{pickupInfo(r)}</td>
              </tr>
            ))}
          </DataTable>
        )}
        <div className="acts" style={{ marginTop: 12 }}>
          <button className="bt ghost" onClick={() => setTick((t) => t + 1)}>Refresh</button>
        </div>
      </div>
    </section>
  );
}
