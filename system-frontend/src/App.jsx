import { Routes, Route } from "react-router-dom";
import ToastProvider from "./components/portal/ToastProvider";
import RouteTransition from "./components/RouteTransition";
import RequireRole from "./components/RequireRole";
import PublicLayout from "./components/site/PublicLayout";
import NotFound from "./pages/site/NotFound";
import Home from "./pages/site/Home";
import About from "./pages/site/About";
import Officials from "./pages/site/Officials";
import Services from "./pages/site/Services";
import Contact from "./pages/site/Contact";
import AuthPage from "./pages/AuthPage";

import ResidentPortal from "./pages/resident/ResidentPortal";
import ResidentDashboard from "./pages/resident/Dashboard";
import Reserve from "./pages/resident/Reserve";
import Complaint from "./pages/resident/Complaint";
import ResidentNotifications from "./pages/resident/Notifications";
import ResidentHistory from "./pages/resident/History";
import ResidentPickups from "./pages/resident/Pickups";

import AdminPortal from "./pages/admin/AdminPortal";
import AdminDashboard from "./pages/admin/Dashboard";
import Accounts from "./pages/admin/Accounts";
import Reservations from "./pages/admin/Reservations";
import Complaints from "./pages/admin/Complaints";
import Reports from "./pages/admin/Reports";
import Notify from "./pages/admin/Notify";
import Analytics from "./pages/admin/Analytics";

import TanodPortal from "./pages/tanod/TanodPortal";
import TanodDashboard from "./pages/tanod/Dashboard";
import Dispatches from "./pages/tanod/Dispatches";
import NotifyIncident from "./pages/tanod/NotifyIncident";
import TanodHistory from "./pages/tanod/History";

export default function App() {
  return (
    <ToastProvider>
      <RouteTransition>
        {(location) => (
    <Routes location={location}>
      {/* public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/officials" element={<Officials />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* login + register */}
      <Route path="/login" element={<AuthPage />} />

      {/* resident portal */}
      <Route path="/resident" element={<RequireRole role="resident"><ResidentPortal /></RequireRole>}>
        <Route index element={<ResidentDashboard />} />
        <Route path="reserve" element={<Reserve />} />
        <Route path="pickups" element={<ResidentPickups />} />
        <Route path="complaint" element={<Complaint />} />
        <Route path="notifications" element={<ResidentNotifications />} />
        <Route path="history" element={<ResidentHistory />} />
      </Route>

      {/* admin portal */}
      <Route path="/admin" element={<RequireRole role="admin"><AdminPortal /></RequireRole>}>
        <Route index element={<AdminDashboard />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notify" element={<Notify />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* tanod portal */}
      <Route path="/tanod" element={<RequireRole role="tanod"><TanodPortal /></RequireRole>}>
        <Route index element={<TanodDashboard />} />
        <Route path="dispatches" element={<Dispatches />} />
        <Route path="incident" element={<NotifyIncident />} />
        <Route path="history" element={<TanodHistory />} />
      </Route>
    </Routes>
        )}
      </RouteTransition>
    </ToastProvider>
  );
}
