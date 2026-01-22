import { useEffect, useState } from "react";
import API from "../../app/api";
import TabBarAdmin from "../../components/TabBarAdmin";

export default function AdminWorkers() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    API.get("/admin/workers").then(res => setItems(res.data.items || []));
  }, []);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-4">Workers</h2>

      {items.map(w => (
        <div key={w._id} className="border rounded p-3 mb-2">
          <div className="font-medium">{w.workerId} - {w.name}</div>
          <div className="text-sm text-gray-600">{w.trade}</div>
          <div className="text-sm mt-1">Monthly Salary: {w.monthlySalary} SAR</div>
        </div>
      ))}

      <TabBarAdmin />
    </div>
  );
}
