import { useEffect,useState } from "react";
import API from "../../app/api";

export default function AttendanceApproval(){
  const [items,setItems]=useState([]);

  async function load(){
    const res = await API.get("/admin/attendance/pending");
    setItems(res.data.items);
  }

  async function decide(id,action){
    await API.post(`/admin/attendance/${id}/decision`,{action});
    load();
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Pending Attendance</h2>

      {items.map(i=>(
        <div key={i._id} className="border rounded p-3 mb-2">
          <div>{i.worker.name}</div>
          <div>{new Date(i.startAt).toLocaleDateString()}</div>
          <div className="flex gap-2 mt-2">
            <button onClick={()=>decide(i._id,"APPROVE")}
              className="flex-1 bg-primary text-white p-2 rounded">
              Approve
            </button>
            <button onClick={()=>decide(i._id,"REJECT")}
              className="flex-1 border p-2 rounded">
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
