import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Tabs from "../../components/portal/Tabs";
import DataTable from "../../components/portal/DataTable";
import Pill from "../../components/portal/Pill";
import Bt from "../../components/portal/Bt";
import Modal from "../../components/portal/Modal";
import ReasonModal from "../../components/portal/ReasonModal";
import KeyValue from "../../components/portal/KeyValue";
import { useToast } from "../../hooks/useToast";
import { COMPLAINT_GROUPS } from "../../data/adminData";
import { dispatchComplaint, resolveComplaint, rejectComplaint, loadComplaintPhoto } from "../../services/adminComplaints";

const REASONS = ["Not a barangay concern", "Not enough details", "Duplicate complaint", "Other"];

// the resident's photo proof, downloaded with the login token
function Proof({ complaint }) {
  const [photo, setPhoto] = useState({ url: "", failed: false });

  useEffect(() => {
    if (!complaint.hasPhoto) return;
    let alive = true;
    let url = "";
    loadComplaintPhoto(complaint.id)
      .then((u) => { url = u; if (alive) setPhoto({ url: u, failed: false }); else URL.revokeObjectURL(u); })
      .catch(() => { if (alive) setPhoto({ url: "", failed: true }); });
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [complaint.id, complaint.hasPhoto]);

  if (photo.url) return <img src={photo.url} alt="Photo proof from the resident" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 10 }} />;
  const label = !complaint.hasPhoto ? "No photo attached" : photo.failed ? "Could not load the photo" : "Loading photo…";
  return <div className="idimg" style={{ height: 120 }}>📷 {label}</div>;
}

// 2.1.2: the admin reads the complaint, then dispatches a tanod, resolves it, or rejects it
function EvaluateModal({ complaint, tanods, onClose, onDispatch, onResolve, onReject }) {
  const first = tanods.find((t) => t.onDuty) || tanods[0];
  const [tanodId, setTanodId] = useState(first ? String(first.id) : "");
  return (
    <Modal onClose={onClose}>
      <h3>Evaluate {complaint.ref}</h3>
      <Proof complaint={complaint} />
      <KeyValue rows={[["Resident", complaint.who], ["House", complaint.house], ["Category", complaint.cat], ["Concern", complaint.desc]]} />
      <label htmlFor="tn">Assign a tanod</label>
      <select id="tn" value={tanodId} onChange={(e) => setTanodId(e.target.value)}>
        {tanods.length === 0 && <option value="">No tanod available</option>}
        {tanods.map((t) => <option key={t.id} value={t.id}>{t.name}{t.onDuty ? "" : " (off duty)"}</option>)}
      </select>
      <div className="acts" style={{ justifyContent: "flex-end", marginTop: 18 }}>
        <button className="bt no" onClick={onReject}>Reject</button>
        <button className="bt ghost" onClick={onResolve}>Resolve without tanod</button>
        <button className="bt okb" disabled={!tanodId} onClick={() => onDispatch(Number(tanodId))}>Dispatch tanod</button>
      </div>
    </Modal>
  );
}

export default function Complaints() {
  const { cmp, cmpError, reloadCmp, tanods } = useOutletContext();
  const toast = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(null); // { type: "evaluate" | "reject", id }
  const [busy, setBusy] = useState(false);

  // always show the latest complaints when this page opens
  useEffect(() => {
    reloadCmp();
  }, [reloadCmp]);

  const list = cmp.filter((c) => filter === "all" || COMPLAINT_GROUPS[filter].includes(c.status));
  const current = modal && cmp.find((c) => c.id === modal.id);

  // runs one backend action, then reloads so the table shows what is really in the database
  const run = async (action, title, text) => {
    if (busy) return;
    setBusy(true);
    setModal(null);
    try {
      await action();
      toast(title, text);
    } catch (e) {
      toast("Action failed", e.message);
    } finally {
      await reloadCmp();
      setBusy(false);
    }
  };

  const dispatch = (c, tanodId) => {
    const t = tanods.find((x) => x.id === tanodId);
    return run(() => dispatchComplaint(c.id, tanodId), "Tanod dispatched", `${t?.name ?? "Tanod"} · ${c.ref}`);
  };
  const resolve = (c) => run(() => resolveComplaint(c.id), "Complaint resolved", c.ref + " · the resident was notified");
  const reject = (c, reason) => run(() => rejectComplaint(c.id, reason), "Complaint rejected", "The resident was notified");

  const action = (c) => {
    if (c.status === "Pending") return <Bt onClick={() => setModal({ type: "evaluate", id: c.id })}>Evaluate</Bt>;
    if (c.status === "Dispatched") return <span className="mini">Waiting for {c.tanod}</span>;
    if (c.status === "Report submitted") return <Bt onClick={() => navigate("/admin/reports")}>Review report</Bt>;
    return null;
  };

  return (
    <section className="view">
      <div className="box">
        <h2 style={{ fontSize: "1.4rem", marginBottom: 6 }}>📝 Complaints</h2>
        <p className="sub" style={{ marginBottom: 14 }}>Evaluate each complaint. Dispatch a tanod if it needs a response.</p>
        {cmpError && (
          <div className="err" role="alert" style={{ marginBottom: 12 }}>
            {cmpError} <button className="lnk" onClick={reloadCmp}>Try again</button>
          </div>
        )}
        <Tabs tabs={[["all", "All"], ["Pending", "Pending"], ["In progress", "In progress"], ["Closed", "Closed"]]} value={filter} onChange={setFilter} />
        {list.length ? (
          <DataTable heads={["Reference", "Resident", "House", "Category", "Concern", "Tanod", "Status", ""]}>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.ref}</td><td>{c.who}</td><td>{c.house}</td><td>{c.cat}</td>
                <td style={{ whiteSpace: "normal", minWidth: 200 }}>{c.desc}</td>
                <td>{c.tanod || "—"}</td><td><Pill status={c.status} /></td><td>{action(c)}</td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <div className="tw"><div className="empty">{cmpError ? "Could not load complaints." : "Nothing here."}</div></div>
        )}
      </div>

      {modal?.type === "evaluate" && current && (
        <EvaluateModal
          complaint={current}
          tanods={tanods}
          onClose={() => setModal(null)}
          onDispatch={(tanodId) => dispatch(current, tanodId)}
          onResolve={() => resolve(current)}
          onReject={() => setModal({ type: "reject", id: current.id })}
        />
      )}
      {modal?.type === "reject" && current && (
        <ReasonModal title="Reject complaint" options={REASONS} onClose={() => setModal(null)} onConfirm={(reason) => reject(current, reason)} />
      )}
    </section>
  );
}
