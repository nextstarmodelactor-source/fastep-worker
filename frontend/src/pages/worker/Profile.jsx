import { useEffect,useState } from "react";
import API from "../../app/api";
import TabBarWorker from "../../components/TabBarWorker";

export default function Profile(){
  const [me,setMe]=useState(null);

  useEffect(()=>{
    API.get("/worker/me").then(res=>setMe(res.data));
  },[]);

  if(!me) return null;

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-4">Profile</h2>

      <div className="border rounded p-4 space-y-2">
        <div>Name: {me.name}</div>
        <div>Trade: {me.trade}</div>
        <div>Phone: {me.phone || "-"}</div>
        <div>Monthly Salary: {me.monthlySalary} SAR</div>
      </div>

      <TabBarWorker/>
    </div>
  );
}
