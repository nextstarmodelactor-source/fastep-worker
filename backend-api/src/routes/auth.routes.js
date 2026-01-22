import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { ENV } from "../config/env.js";
import { Admin } from "../models/Admin.js";
import { Worker } from "../models/Worker.js";
import { parseBody, zEmail, zPassword, zWorkerId } from "../utils/validate.js";

export const authRouter = express.Router();

const workerLoginSchema = z.object({
  workerId: zWorkerId,
  password: zPassword
});

authRouter.post("/worker/login", parseBody(workerLoginSchema), async (req, res) => {
  const { workerId, password } = req.body;
  const worker = await Worker.findOne({ workerId, isActive: true });
  if (!worker) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await worker.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: worker._id.toString(), role: "WORKER", workerId: worker.workerId },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    worker: {
      id: worker._id,
      workerId: worker.workerId,
      name: worker.name,
      trade: worker.trade,
      phone: worker.phone,
      monthlySalary: worker.monthlySalary,
      photoUrl: worker.photoUrl
    }
  });
});

const adminLoginSchema = z.object({
  email: zEmail,
  password: zPassword
});

authRouter.post("/admin/login", parseBody(adminLoginSchema), async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await admin.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: admin._id.toString(), role: "ADMIN" },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );

  res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
});

