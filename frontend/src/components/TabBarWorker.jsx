import { Link, useLocation } from "react-router-dom";

export default function TabBarAdmin() {
  const { pathname } = useLocation();

  const tabs = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/live", label: "Live" },
    { path: "/admin/approvals", label: "Approvals" },
    { path: "/admin/workers", label: "Workers" },
    { path: "/admin/notifications", label: "Notifications" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex">
      {tabs.map(t => (
        <Link
          key={t.path}
          to={t.path}
          className={`flex-1 text-center p-3 text-sm ${
            pathname === t.path ? "text-primary font-semibold" : "text-gray-500"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
