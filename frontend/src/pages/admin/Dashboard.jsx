import { useEffect, useState } from "react";
import API from "../../app/api";
import TabBarAdmin from "../../components/TabBarAdmin.jsx";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/admin/dashboard").then(res => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Live Working</div>
          <div className="text-2xl font-semibold">{data.live}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Pending Attendance</div>
          <div className="text-2xl font-semibold">{data.pendingAttendance}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Pending Overtime</div>
          <div className="text-2xl font-semibold">{data.pendingOt}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600">Pending Leave</div>
          <div className="text-2xl font-semibold">{data.pendingLeave}</div>
        </div>
      </div>

      <TabBarAdmin />
    </div>
  );
}
