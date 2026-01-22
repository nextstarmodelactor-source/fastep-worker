import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import { getRole } from "./app/auth.js";

// Worker
import WorkerDashboard from "./pages/worker/Dashboard.jsx";
import WorkerHistory from "./pages/worker/History.jsx";
import WorkerSiteFeed from "./pages/worker/SiteFeed.jsx";
import WorkerProfile from "./pages/worker/Profile.jsx";

// Admin
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminLive from "./pages/admin/Live.jsx";
import AdminApprovals from "./pages/admin/Approvals.jsx";
import AdminSalary from "./pages/admin/Salary.jsx";
import AdminWorkers from "./pages/admin/Workers.jsx";
import AdminNotifications from "./pages/admin/Notifications.jsx";

export default function App() {
  const role = getRole();

  return (
    <BrowserRouter>
      <Routes>

        {/* Root Login / Auto Redirect */}
        <Route
          path="/"
          element={
            role === "WORKER"
              ? <Navigate to="/worker" />
              : role === "ADMIN"
              ? <Navigate to="/admin" />
              : <Login />
          }
        />

        {/* Worker Routes */}
        <Route
          path="/worker"
          element={role === "WORKER" ? <WorkerDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/worker/history"
          element={role === "WORKER" ? <WorkerHistory /> : <Navigate to="/" />}
        />
        <Route
          path="/worker/feed"
          element={role === "WORKER" ? <WorkerSiteFeed /> : <Navigate to="/" />}
        />
        <Route
          path="/worker/profile"
          element={role === "WORKER" ? <WorkerProfile /> : <Navigate to="/" />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/live"
          element={role === "ADMIN" ? <AdminLive /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/approvals"
          element={role === "ADMIN" ? <AdminApprovals /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/salary"
          element={role === "ADMIN" ? <AdminSalary /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/workers"
          element={role === "ADMIN" ? <AdminWorkers /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/notifications"
          element={role === "ADMIN" ? <AdminNotifications /> : <Navigate to="/" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
