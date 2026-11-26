import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useSpotlight, useRipple } from "../../hooks/useEffects";
import { useTilt } from "../../hooks/useTilt";
import { logout as endSession } from "../../services/auth";

const ICONS = {
  dashboard: "🏠", reserve: "🏟️", complaint: "📝", notifications: "🔔", history: "📑",
  accounts: "👥", reservations: "📅", complaints: "📢", reports: "📋", notify: "📣",
  analytics: "📊", dispatches: "🚨", incident: "🆘", pickups: "📦",
};

// Sidebar dashboard shared by the resident, admin and tanod portals.
// brand = { icon, text }   links = [{ to, label, end, badge }]   context = data for the pages
export default function PortalLayout({ brand, links, context }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const progress = useRef(null);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sb") === "1"; } catch { return false; }
  });
  useSpotlight(".qc,.st,.an");
  useRipple(".go,.bt");
  useTilt(".st,.qc", 9);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("sb", next ? "1" : "0"); } catch { /* ignore */ }
  };

  // gold scroll-progress bar
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? el.scrollTop / max : 0})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  const go = (to) => { navigate(to); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const isOn = (l) => (l.end ? pathname === l.to : pathname === l.to || pathname.startsWith(l.to + "/"));
  const iconOf = (l) => ICONS[l.end ? "dashboard" : l.to.split("/").pop()] || "•";
  const active = links.filter(isOn).sort((a, b) => b.to.length - a.to.length)[0];
  const dateLabel = new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" });
  // Logging out goes to /login. RouteTransition plays the curtain and shows the "Logged out" notification.
  const logout = (e) => { e.preventDefault(); endSession(); navigate("/login"); };

  // Notification bell: resident → real notifications, admin/tanod → what is waiting in each tab
  let items, unread, onReadAll;
  if (Array.isArray(context?.notes)) {
    items = context.notes.slice(0, 6).map((n, i) => ({ id: i, title: n.t, text: n.d, time: n.w, unread: n.u, onClick: () => context.readNote?.(i) }));
    unread = context.unread ?? context.notes.filter((n) => n.u).length;
    onReadAll = context.readAll;
  } else {
    const waiting = links.filter((l) => l.badge > 0);
    items = waiting.map((l) => ({ id: l.to, title: `${l.badge} pending in ${l.label}`, text: "Tap to review", unread: true, onClick: () => go(l.to) }));
    unread = waiting.reduce((s, l) => s + l.badge, 0);
  }
  const allLink = links.find((l) => /notifications$/.test(l.to));

  return (
    <div className="portal">
      <div className="pg-prog" aria-hidden="true"><i ref={progress} /></div>
      <div className={"shell" + (collapsed ? " collapsed" : "")}>
        <aside className="sb">
          <div className="sb-brand">
            <span className="lg">{brand.icon}</span>
            <div className="sb-tx"><b>Barangay Navotas</b><small>{brand.text}</small></div>
            <button className="sb-col" onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>‹</button>
          </div>

          <nav className="sb-nav" aria-label="Portal">
            {links.map((l, i) => (
              <button key={l.to} title={l.label} style={{ "--i": i }} className={"sb-link" + (isOn(l) ? " on" : "")} aria-current={isOn(l) ? "page" : undefined} onClick={() => go(l.to)}>
                <span className="sb-ic">{iconOf(l)}</span>
                <span className="sb-tx">{l.label}</span>
                {l.badge > 0 && <span className="sb-badge">{l.badge}</span>}
              </button>
            ))}
          </nav>

          <div className="sb-user">
            <span className="sb-av">{brand.icon}</span>
            <div className="sb-tx"><b>{brand.text}</b><small><i /> Online</small></div>
          </div>
          <a className="sb-out" href="/login" onClick={logout}>
            <span>⎋</span><span className="sb-tx">Logout</span>
          </a>
        </aside>

        <div className="main">
          <header className="topbar">
            <div className="tb-title">
              <small>{dateLabel}</small>
              <h2>{active?.label || brand.text}</h2>
            </div>
            <div className="tools">
              <NotificationBell items={items} unread={unread} onReadAll={onReadAll} onViewAll={allLink ? () => go(allLink.to) : undefined} />
              <a className="ibtn tb-out" href="/login" onClick={logout} aria-label="Logout">⎋</a>
            </div>
          </header>
          <main className="wrap">
            <div key={pathname} className="page-in"><Outlet context={context} /></div>
          </main>
          <footer className="foot">© 2026 Barangay Navotas · {brand.text}</footer>
        </div>
      </div>
    </div>
  );
}
