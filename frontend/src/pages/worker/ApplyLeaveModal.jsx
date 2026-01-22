import { useState } from "react";
import API from "../../app/api";

export default function ApplyLeaveModal({ onClose, onDone }) {
  const [leaveDate,setLeaveDate]=useState("");
  const [reason,setReason]=useState("Sick");
  const [other,setOther]=useState("");

  async function submit(){
    await API.post("/worker/leave/apply",{
      leaveDate, reason, otherText: other
    });
    onDone();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white p-4 rounded w-80">
        <h3 className="font-semibold mb-3">Apply Leave</h3>

        <input type="date"
          className="border p-2 w-full mb-2"
          onChange={e=>setLeaveDate(e.target.value)}/>

        <select className="border p-2 w-full mb-2"
          onChange={e=>setReason(e.target.value)}>
          <option>Sick</option>
          <option>Emergency</option>
          <option>Family Problem</option>
          <option>Passport / Iqama Work</option>
          <option>Camp Issue</option>
          <option>Other</option>
        </select>

        {reason==="Other" && (
          <input className="border p-2 w-full mb-2"
            placeholder="Other reason"
            onChange={e=>setOther(e.target.value)}/>
        )}

        <div className="flex gap-2">
          <button className="flex-1 border p-2 rounded" onClick={onClose}>Cancel</button>
          <button className="flex-1 bg-primary text-white p-2 rounded" onClick={submit}>Submit</button>
        </div>
      </div>
    </div>
  );
}
