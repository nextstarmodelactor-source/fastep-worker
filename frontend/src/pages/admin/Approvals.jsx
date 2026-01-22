import { useEffect, useState } from "react";
import API from "../../app/api";
import TabBarAdmin from "../../components/TabBarAdmin.jsx";

export default function Approvals() {
  const [tab, setTab] = useState("ATTENDANCE");
  const [attendance, setAttendance] = useState([]);
  const [overtime, setOvertime] = useState([]);
  const [leave, setLeave] = useState([]);

  async function load() {
    const a = await API.get("/admin/attendance/pending");
    const o = await API.get("/admin/overtime/pending");
    const l = await API.get("/admin/leave/pending");
    setAttendance(a.data.items || []);
    setOvertime(o.data.items || []);
    setLeave(l.data.items || []);
  }

  async function decideAttendance(id, action) {
    await API.post(`/admin/attendance/${id}/decision`, { action });
    load();
  }

  async function decideOt(id, action) {
    await API.post(`/admin/overtime/${id}/decision`, { action });
    load();
  }

  async function decideLeave(id, action) {
    await API.post(`/admin/leave/${id}/decision`, { action });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-3">Approvals</h2>

      <div className="flex gap-2 mb-3">
        <button
          className={`flex-1 p-2 rounded border ${tab === "ATTENDANCE" ? "bg-primary text-white border-primary" : ""}`}
          onClick={() => setTab("ATTENDANCE")}
        >
          Attendance
        </button>
        <button
          className={`flex-1 p-2 rounded border ${tab === "OVERTIME" ? "bg-primary text-white border-primary" : ""}`}
          onClick={() => setTab("OVERTIME")}
        >
          Overtime
        </button>
        <button
          className={`flex-1 p-2 rounded border ${tab === "LEAVE" ? "bg-primary text-white border-primary" : ""}`}
          onClick={() => setTab("LEAVE")}
        >
          Leave
        </button>
      </div>

      {tab === "ATTENDANCE" && (
        <div>
          {attendance.length === 0 && (
            <div className="border rounded p-3 text-gray-600">No pending attendance.</div>
          )}

          {attendance.map(i => (
            <div key={i._id} className="border rounded p-3 mb-2">
              <div className="font-medium">{i.worker?.name}</div>
              <div className="text-sm text-gray-600">{i.worker?.trade}</div>
              <div className="text-sm mt-1">
                Date: {new Date(i.startAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => decideAttendance(i._id, "APPROVE")}
                  className="flex-1 bg-primary text-white p-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => decideAttendance(i._id, "REJECT")}
                  className="flex-1 border p-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "OVERTIME" && (
        <div>
          {overtime.length === 0 && (
            <div className="border rounded p-3 text-gray-600">No pending overtime.</div>
          )}

          {overtime.map(i => (
            <div key={i._id} className="border rounded p-3 mb-2">
              <div className="font-medium">{i.worker?.name}</div>
              <div className="text-sm text-gray-600">{i.worker?.trade}</div>
              <div className="text-sm mt-1">
                Requested: {new Date(i.requestedAt).toLocaleString()}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => decideOt(i._id, "APPROVE")}
                  className="flex-1 bg-primary text-white p-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => decideOt(i._id, "REJECT")}
                  className="flex-1 border p-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "LEAVE" && (
        <div>
          {leave.length === 0 && (
            <div className="border rounded p-3 text-gray-600">No pending leave requests.</div>
          )}

          {leave.map(i => (
            <div key={i._id} className="border rounded p-3 mb-2">
              <div className="font-medium">{i.worker?.name}</div>
              <div className="text-sm text-gray-600">{i.worker?.trade}</div>
              <div className="text-sm mt-1">Leave Date: {i.leaveDate}</div>
              <div className="text-sm mt-1">Reason: {i.reason}</div>
              {i.reason === "Other" && i.otherText ? (
                <div className="text-sm mt-1">Other: {i.otherText}</div>
              ) : null}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => decideLeave(i._id, "ACCEPT")}
                  className="flex-1 bg-primary text-white p-2 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => decideLeave(i._id, "REJECT")}
                  className="flex-1 border p-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TabBarAdmin />
    </div>
  );
}
