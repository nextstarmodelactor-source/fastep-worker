import { useState } from "react";
import API from "../app/api.js";
import { saveAuth } from "../app/auth.js";

export default function Login() {
  const [mode, setMode] = useState("WORKER");
  const [workerId, setWorkerId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    try {
      if (mode === "WORKER") {
        const res = await API.post("/auth/worker/login", {
          workerId,
          password
        });
        saveAuth(res.data.token, "WORKER");
        location.href = "/worker";
      } else {
        const res = await API.post("/auth/admin/login", {
          email,
          password
        });
        saveAuth(res.data.token, "ADMIN");
        location.href = "/admin";
      }
    } catch {
      alert("Login failed");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-80 p-6 border rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4">FASTEP WORK</h1>

        <div className="flex mb-4">
          <button className={`flex-1 ${mode==="WORKER"?"bg-primary text-white":"border"}`} onClick={()=>setMode("WORKER")}>Worker</button>
          <button className={`flex-1 ${mode==="ADMIN"?"bg-primary text-white":"border"}`} onClick={()=>setMode("ADMIN")}>Admin</button>
        </div>

        {mode==="WORKER" && (
          <input className="border p-2 w-full mb-2" placeholder="Worker ID" onChange={e=>setWorkerId(e.target.value)} />
        )}

        {mode==="ADMIN" && (
          <input className="border p-2 w-full mb-2" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
        )}

        <input type="password" className="border p-2 w-full mb-4" placeholder="Password" onChange={e=>setPassword(e.target.value)} />

        <button className="bg-primary text-white w-full p-2 rounded" onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
}
