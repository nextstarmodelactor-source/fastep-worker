import { useEffect, useState } from "react";
import API from "../../app/api";
import TabBarAdmin from "../../components/TabBarAdmin.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);

  async function load() {
    const res = await API.get("/admin/notifications");
    setItems(res.data.items || []);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-3">Notifications</h2>

      {items.length === 0 && (
        <div className="border rounded p-3 text-gray-600">
          No notifications.
        </div>
      )}

      {items.map(n => (
        <div key={n._id} className="border rounded p-3 mb-2">
          <div className="font-medium">{n.title}</div>
          <div className="text-sm text-gray-700 mt-1">{n.body}</div>
          <div className="text-xs text-gray-500 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
        </div>
      ))}

      <TabBarAdmin />
    </div>
  );
}
