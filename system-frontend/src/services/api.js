// The only place that talks to the backend. Every page uses these helpers.
// Set VITE_API_URL in system-frontend/.env if the backend is not on http://localhost:5000
const BASE = (import.meta.env?.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const KEY = "bn_session"; // { token, user } saved after login

export class ApiError extends Error {
  constructor(message, { status = 0, errors = {}, code } = {}) {
    super(message);
    this.status = status;
    this.errors = errors; // field errors from the backend, e.g. { reason: "A reason is required." }
    this.code = code;
  }
}

export const getSession = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
};
export const saveSession = (session) => {
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* ignore */ }
};
export const clearSession = () => {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
};
const token = () => getSession()?.token || "";

async function send(path, { method = "GET", json, form } = {}) {
  const headers = {};
  if (token()) headers.Authorization = `Bearer ${token()}`;
  let body;
  if (json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  else if (form) body = form; // FormData: the browser sets the content type

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body });
  } catch {
    throw new ApiError("Cannot reach the server. Make sure the backend is running (npm start in system-backend).", { code: "NETWORK" });
  }
  // an expired or invalid login: forget it and tell the app (RequireRole sends the user to /login)
  if (res.status === 401 && headers.Authorization && !path.startsWith("/auth/login")) {
    clearSession();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("bn:session-ended"));
  }
  return res;
}

// api("/admin/reservations")  ->  parsed JSON, or throws ApiError with the backend's message
export async function api(path, options) {
  const res = await send(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message || "Something went wrong. Please try again.", { status: res.status, errors: data.errors, code: data.code });
  }
  return data;
}

// Protected images/files cannot go in <img src> directly (they need the login token).
// This downloads one and returns a temporary URL for <img src>. Call URL.revokeObjectURL(url) when done.
export async function apiBlobUrl(path) {
  const res = await send(path);
  if (!res.ok) throw new ApiError("Could not load the file.", { status: res.status });
  return URL.createObjectURL(await res.blob());
}
