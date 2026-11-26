import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getSession } from "../services/api";

const go = (why) => "/login?why=" + encodeURIComponent(why);

// <RequireRole role="admin"><AdminPortal /></RequireRole>
// Only lets a logged-in user with that role in. Everyone else is sent to /login (or to their own portal).
export default function RequireRole({ role, children }) {
  const navigate = useNavigate();
  const [session] = useState(getSession); // read once, so logging out does not bounce to /login twice

  // the backend said the login expired
  useEffect(() => {
    const ended = () => navigate(go("Your session expired. Please log in again."), { replace: true });
    window.addEventListener("bn:session-ended", ended);
    return () => window.removeEventListener("bn:session-ended", ended);
  }, [navigate]);

  if (!session?.token) return <Navigate to={go("Please log in to continue.")} replace />;
  if (session.user?.role !== role) return <Navigate to={"/" + session.user.role} replace />;
  return children;
}
