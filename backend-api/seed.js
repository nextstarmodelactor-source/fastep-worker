import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./src/config/db.js";
import { Admin } from "./src/models/Admin.js";
import { Worker } from "./src/models/Worker.js";

async function seed() {
  await connectDb();

  console.log("Connected to database");

  // ===== Create Admin =====
  const adminEmail = "admin@fastep.com";
  const adminPassword = "Admin@123";

  const existingAdmin = await Admin.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const passwordHash = await Admin.hashPassword(adminPassword);

    await Admin.create({
      email: adminEmail,
      passwordHash,
      name: "FASTEP Admin"
    });

    console.log("Admin created:");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
  } else {
    console.log("Admin already exists");
  }

  // ===== Workers Seed Data =====
  const workers = [
    { workerId: "FW-101", name: "Saddam Hussain", trade: "Painter", salary: 1800 },
    { workerId: "FW-102", name: "Amrendra Singh", trade: "Pipe Fitter", salary: 2200 },
    { workerId: "FW-103", name: "Mohammad Ameen", trade: "Helper", salary: 1500 },
    { workerId: "FW-104", name: "Rahim Khan", trade: "Electrician", salary: 2000 },
    { workerId: "FW-105", name: "Salman Ali", trade: "Plumber", salary: 1900 }
  ];

  const defaultWorkerPassword = "1234";

  for (const w of workers) {
    const exists = await Worker.findOne({ workerId: w.workerId });

    if (!exists) {
      const passwordHash = await Worker.hashPassword(defaultWorkerPassword);

      await Worker.create({
        workerId: w.workerId,
        passwordHash,
        name: w.name,
        trade: w.trade,
        phone: "",
        monthlySalary: w.salary,
        photoUrl: "",
        isActive: true
      });

      console.log("Worker created:", w.workerId, w.name);
    } else {
      console.log("Worker already exists:", w.workerId);
    }
  }

  console.log("Seeding completed");
  mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
