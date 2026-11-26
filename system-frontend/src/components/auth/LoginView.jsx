import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "./PasswordInput";
import { login } from "../../services/auth";

const ROLES = [["Resident", "🏠 Resident"], ["Admin", "🛡️ Admin"], ["Tanod", "👮 Tanod"]];
const HOME = { Resident: "/resident", Admin: "/admin", Tanod: "/tanod" };

// why = message from the website (e.g. "Log in to reserve the Covered Court.")
// pending = { email, ref } of someone who just registered and is not verified yet
export default function LoginView({ why, pending, onRegister }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("Resident");
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Real login: the backend checks the email, password and role, then we open that portal.
  const submit = async () => {
    const email = form.email.trim().toLowerCase();
    if (role === "Resident" && pending && email === pending.email) {
      setMsg("Your account is still pending. The barangay admin is verifying your National ID. You can log in once it is approved.");
      return;
    }
    if (!email || !form.password) { setMsg("Enter your email and password."); return; }
    setMsg("");
    setLoading(true); // button shows a spinner, then RouteTransition plays the "Welcome back" curtain
    try {
      await login({ email, password: form.password, role });
      timer.current = setTimeout(() => navigate(HOME[role]), 600);
    } catch (err) {
      setLoading(false);
      setMsg(err.message);
    }
  };

  return (
    <main className="login-split">
      <section className="login-left">
        <span className="badge">🛡️ Secure Portal</span>
        <h2>Welcome to<br /><em>Barangay Navotas</em></h2>
        <p>Sign in to reserve facilities, file complaints, and get updates from the barangay.</p>
        <ul className="feat">
          <li><span>🏟️</span>Reserve barangay facilities online</li>
          <li><span>📝</span>File complaints with photo proof</li>
          <li><span>🔔</span>Get updates on every request</li>
        </ul>
      </section>
      <section className="login-right">
        <div className="lcard">
          <h3>👤 Log In</h3>
          <p className="lsub">Enter your credentials to continue</p>
          {why && <div className="notice">{why}</div>}

          <form onSubmit={(e) => { e.preventDefault(); if (!loading) submit(); }} noValidate>
            <span className="lbl">Login as</span>
            <div className="roles" style={{ "--i": ROLES.findIndex(([r]) => r === role) }}>
              {ROLES.map(([r, label]) => (
                <button key={r} type="button" className={r === role ? "on" : ""} onClick={() => { setRole(r); setMsg(""); }}>{label}</button>
              ))}
            </div>

            <label className="lbl" htmlFor="le">Email address</label>
            <input id="le" type="email" autoComplete="username" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label className="lbl" htmlFor="lp">Password</label>
            <PasswordInput id="lp" autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

            <div className="opts">
              <label className="chk"><input type="checkbox" /> Remember me</label>
              <button type="button" className="lnk">Forgot password?</button>
            </div>
            <button type="submit" className={"lgo" + (loading ? " loading" : "")} disabled={loading}>
              {loading ? <><span className="spinr" /> Signing in…</> : `Log In as ${role}`}
            </button>
          </form>
          {msg && <div className="msg" role="status" style={{ display: "block" }}>{msg}</div>}
          <div className="lfoot">Don't have an account? <button type="button" className="lnk" onClick={onRegister}>Register here</button></div>
        </div>
      </section>
    </main>
  );
}
