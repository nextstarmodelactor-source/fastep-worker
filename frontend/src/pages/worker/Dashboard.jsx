import { useEffect, useState } from "react";
import API from "../../app/api.js";

export default function WorkerDashboard() {
  const [data, setData] = useState(null);

  async function load() {
    const res = await API.get("/worker/dashboard");
    setData(res.data);
  }

  async function startJob() {
    await API.post("/worker/attendance/start");
    load();
  }

  async function endJob() {
    await API.post("/worker/attendance/end");
    load();
  }

  useEffect(()=>{ load(); },[]);

  if (!data) return null;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Dashboard</h2>

      <div className="border rounded p-4 mb-4">
        <div>Status: {data.status}</div>
        <div>Worked Time: {(data.workedMs/3600000).toFixed(2)} hrs</div>
      </div>

      {data.status==="NOT_STARTED" && (
        <button className="bg-primary text-white p-3 w-full rounded" onClick={startJob}>START JOB</button>
      )}

      {data.status!=="NOT_STARTED" && (
        <button className="bg-primary text-white p-3 w-full rounded" onClick={endJob}>END JOB</button>
      )}
    </div>
  );
}
