import { useEffect, useState } from "react";
import API from "../../app/api";
import TabBarAdmin from "../../components/TabBarAdmin";

export default function Salary() {
  const [workers, setWorkers] = useState([]);
  const [workerId, setWorkerId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    API.get("/admin/workers").then(res => setWorkers(res.data.items || []));
  }, []);

  function downloadPdf() {
    if (!workerId || !from || !to) {
      alert("Select worker and date range");
      return;
    }
    const base = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    const url = `${base}/admin/salary/pdf?workerId=${workerId}&from=${from}&to=${to}`;
    window.open(url, "_blank");
  }

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-3">Salary Sheet</h2>

      <div className="border rounded p-4 space-y-3">
        <div>
          <div className="text-sm text-gray-600 mb-1">Worker</div>
          <select className="border p-2 w-full rounded" onChange={e => setWorkerId(e.target.value)}>
            <option value="">Select worker</option>
            {workers.map(w => (
              <option key={w._id} value={w._id}>
                {w.workerId} - {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-sm text-gray-600 mb-1">From</div>
            <input type="date" className="border p-2 w-full rounded" onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">To</div>
            <input type="date" className="border p-2 w-full rounded" onChange={e => setTo(e.target.value)} />
          </div>
        </div>

        <button onClick={downloadPdf} className="bg-primary text-white w-full p-3 rounded">
          Download PDF
        </button>
      </div>

      <TabBarAdmin />
    </div>
  );
}
