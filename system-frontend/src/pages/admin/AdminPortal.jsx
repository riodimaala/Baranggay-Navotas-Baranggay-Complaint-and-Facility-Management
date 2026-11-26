import { useCallback, useEffect, useState } from "react";
import PortalLayout from "../../components/portal/PortalLayout";
import {
  INITIAL_ACCOUNTS, INITIAL_COMPLAINTS, INITIAL_REPORTS, INITIAL_NOTICES, TANODS,
} from "../../data/adminData";
import { listReservations } from "../../services/adminReservations";

// change one item (found by its ref) in a list
const patch = (setter) => (ref, changes) =>
  setter((list) => list.map((x) => (x.ref === ref ? { ...x, ...changes } : x)));

// Holds all admin data and shares it with the admin pages.
// Reservations come from the backend. The other lists are still sample data until they are connected.
export default function AdminPortal() {
  const [accs, setAccs] = useState(INITIAL_ACCOUNTS);
  const [rsv, setRsv] = useState([]);
  const [rsvError, setRsvError] = useState("");
  const [cmp, setCmp] = useState(INITIAL_COMPLAINTS);
  const [rep, setRep] = useState(INITIAL_REPORTS);
  const [notices, setNotices] = useState(INITIAL_NOTICES);

  // loads the reservations from the database (pages call this again after every change)
  const reloadRsv = useCallback(async () => {
    try {
      setRsv(await listReservations());
      setRsvError("");
    } catch (e) {
      setRsvError(e.message);
    }
  }, []);

  // first load, when the admin portal opens
  useEffect(() => {
    let alive = true;
    listReservations()
      .then((rows) => alive && setRsv(rows))
      .catch((e) => alive && setRsvError(e.message));
    return () => { alive = false; };
  }, []);

  const n = {
    acc: accs.filter((a) => a.status === "Pending").length,
    rsv: rsv.filter((r) => r.status === "Pending").length,
    cmp: cmp.filter((c) => c.status === "Pending").length,
    rep: rep.filter((r) => r.status === "Submitted").length,
  };

  const context = {
    accs, rsv, cmp, rep, notices, tanods: TANODS, n,
    rsvError, reloadRsv,
    setAcc: patch(setAccs), setCmp: patch(setCmp), setRep: patch(setRep),
    addNotice: (notice) => setNotices((l) => [notice, ...l]),
  };

  const links = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/accounts", label: "Accounts", badge: n.acc },
    { to: "/admin/reservations", label: "Reservations", badge: n.rsv },
    { to: "/admin/complaints", label: "Complaints", badge: n.cmp },
    { to: "/admin/reports", label: "Reports", badge: n.rep },
    { to: "/admin/notify", label: "Notify" },
    { to: "/admin/analytics", label: "Analytics" },
  ];

  return <PortalLayout brand={{ icon: "🛡️", text: "Admin Portal" }} links={links} context={context} />;
}
