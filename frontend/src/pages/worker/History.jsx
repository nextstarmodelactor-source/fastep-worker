import { useEffect,useState } from "react";
import API from "../../app/api";
import TabBarWorker from "../../components/TabBarWorker";
import ApplyLeaveModal from "./ApplyLeaveModal";

export default function History(){
  const [attendance,setAttendance]=useState([]);
  const [leaves,setLeaves]=useState([]);
  const [showLeave,setShowLeave]=useState(false);

  async function load(){
    const a = await API.get("/worker/attendance/history");
    const l = await API.get("/worker/leave/history");
    setAttendance(a.data.items);
    setLeaves(l.data.items);
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-3">Attendance History</h2>

      {attendance.map(a=>(
        <div key={a._id} className="border rounded p-3 mb-2">
          <div>Date: {new Date(a.startAt).toLocaleDateString()}</div>
          <div>Status: {a.status}</div>
          <div>Estimated: {a.estimatedBasePay} SAR</div>
          <div>Approved: {a.approvedBasePay} SAR</div>
        </div>
      ))}

      <h2 className="text-lg font-semibold mt-5 mb-3">Leave History</h2>

      {leaves.map(l=>(
        <div key={l._id} className="border rounded p-3 mb-2">
          <div>Date: {l.leaveDate}</div>
          <div>Reason: {l.reason}</div>
          <div>Status: {l.status}</div>
        </div>
      ))}

      <button onClick={()=>setShowLeave(true)}
        className="bg-primary text-white w-full p-3 rounded mt-3">
        APPLY LEAVE
      </button>

      {showLeave && (
        <ApplyLeaveModal onClose={()=>setShowLeave(false)} onDone={()=>{setShowLeave(false);load();}}/>
      )}

      <TabBarWorker/>
    </div>
  );
}
