import { useEffect,useState } from "react";
import API from "../../app/api";
import TabBarWorker from "../../components/TabBarWorker";

export default function SiteFeed(){
  const [posts,setPosts]=useState([]);

  useEffect(()=>{
    API.get("/feed").then(res=>setPosts(res.data.items));
  },[]);

  return (
    <div className="p-4 pb-20">
      <h2 className="text-lg font-semibold mb-3">Site Feed</h2>

      {posts.map(p=>(
        <div key={p._id} className="border rounded p-3 mb-3">
          <div className="font-medium">
            {p.worker ? p.worker.name : "Admin"}
          </div>
          <div className="text-sm mt-1">{p.text}</div>
        </div>
      ))}

      <TabBarWorker/>
    </div>
  );
}
