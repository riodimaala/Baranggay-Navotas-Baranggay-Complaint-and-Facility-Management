export const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const nowT = () => new Date().toTimeString().slice(0, 5); // "14:30"

export const nowS = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
  ", " +
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

// "18:00" -> "6:00 PM"
export const t12 = (t) => {
  const [h, m] = t.split(":").map(Number);
  return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + " " + (h < 12 ? "AM" : "PM");
};

// "2026-10-05" -> "Oct 5"
export const shortDate = (d) =>
  new Date(d + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

// earliest date allowed in a date input (today, local time)
export const minDate = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

export const refNo = (prefix, n) => prefix + "-" + String(n).padStart(4, "0");

// "2026-10-10 08:00:00" -> "Oct 10, 8:00 AM"  (backend date-time text)
export const stampLabel = (s) => {
  if (!s) return "";
  const [d, t] = String(s).split(/[ T]/);
  return shortDate(d) + (t ? ", " + t12(t.slice(0, 5)) : "");
};
