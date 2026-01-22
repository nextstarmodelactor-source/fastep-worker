import { useEffect, useState } from "react";
import API from "../../app/api";
import TabBarAdmin from "../../components/TabBarAdmin";

export default function Live() {
  const [items, setItems] = useState([]);

  async function load() {
    const res = await API.get("/admin/live");
    setItems(res.data.items || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-3">Live Working Workers</h2>

      {items.length === 0 && (
        <div className="border rounded p-3 text-gray-600">
          No live workers right now.
        </div>
      )}

      {items.map(i => (
        <div key={i._id} className="border rounded p-3 mb-2">
          <div className="font-medium">{i.worker?.name || "Worker"}</div>
          <div className="text-sm text-gray-600">{i.worker?.trade || "-"}</div>
          <div className="text-sm mt-1">
            Start: {new Date(i.startAt).toLocaleString()}
          </div>
        </div>
      ))}

      <TabBarAdmin />
    </div>
  );
}
