import { api, saveSession, clearSession } from "./api";

// role is "Resident" | "Admin" | "Tanod" (the backend checks that it matches the account)
export async function login({ email, password, role }) {
  const data = await api("/auth/login", { method: "POST", json: { email: email.trim(), password, role } });
  saveSession(data); // { token, user }
  return data.user;
}

export const logout = clearSession;
