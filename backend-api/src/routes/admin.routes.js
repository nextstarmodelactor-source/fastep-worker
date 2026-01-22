import express from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Worker } from "../models/Worker.js";
import { Admin } from "../models/Admin.js";
import { Attendance } from "../models/Attendance.js";
import { Overtime } from "../models/Overtime.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { Notification } from "../models/Notification.js";
import { nowUtc, addMs, MIN_MS, HOUR_MS } from "../utils/time.js";
import { parseBody } from "../utils/validate.js";
import { computeBasePayForAttendance, computeOtPay } from "../services/salary.service.js";
import { makeSalaryPdf } from "../services/pdf.service.js";
import { notifyWorker, notifyAdmins } from "../services/notifications.service.js";

export const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

async function getAdmin(req) {
  const admin = await Admin.findById(req.auth.sub);
  if (!admin) {
    const err = new Error("Admin not found");
    err.status = 404;
    throw err;
  }
  return admin;
}

// Admin dashboard summary
adminRouter.get("/dashboard", async (req, res) => {
  const live = await Attendance.countDocuments({ endAt: null });
  const pendingAttendance = await Attendance.countDocuments({ status: "PENDING", endAt: { $ne: null } });
  const pendingOt = await Overtime.countDocuments({ status: "PENDING" });
  const pendingLeave = await LeaveRequest.countDocuments({ status: "PENDING" });

  res.json({ live, pendingAttendance, pendingOt, pendingLeave });
});

// Worker CRUD (minimal)
const createWorkerSchema = z.object({
  workerId: z.string().min(2).max(30),
  password: z.string().min(4).max(200),
  name: z.string().min(2).max(100),
  trade: z.string().min(2).max(100),
  phone: z.string().max(30).optional(),
  monthlySalary: z.number().min(0),
  photoUrl: z.string().max(500).optional()
});

adminRouter.post("/workers", parseBody(createWorkerSchema), async (req, res) => {
  const { workerId, password, name, trade, phone = "", monthlySalary, photoUrl = "" } = req.body;

  const exists = await Worker.findOne({ workerId });
  if (exists) return res.status(400).json({ error: "Worker ID already exists" });

  const passwordHash = await Worker.hashPassword(password);
  const worker = await Worker.create({
    workerId,
    passwordHash,
    name,
    trade,
    phone,
    monthlySalary,
    photoUrl
  });

  res.json({ worker });
});

adminRouter.get("/workers", async (req, res) => {
  const list = await Worker.find().sort({ createdAt: -1 }).limit(500);
  res.json({ items: list });
});

const updateWorkerSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  trade: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).optional(),
  monthlySalary: z.number().min(0).optional(),
  photoUrl: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(4).max(200).optional()
});

adminRouter.patch("/workers/:id", parseBody(updateWorkerSchema), async (req, res) => {
  const w = await Worker.findById(req.params.id);
  if (!w) return res.status(404).json({ error: "Worker not found" });

  if (req.body.password) w.passwordHash = await Worker.hashPassword(req.body.password);

  for (const k of ["name", "trade", "phone", "monthlySalary", "photoUrl", "isActive"]) {
    if (req.body[k] !== undefined) w[k] = req.body[k];
  }

  await w.save();
  res.json({ worker: w });
});

// Live workers
adminRouter.get("/live", async (req, res) => {
  const list = await Attendance.find({ endAt: null }).sort({ startAt: -1 }).populate("worker");
  res.json({ items: list });
});

// Pending attendance approvals
adminRouter.get("/attendance/pending", async (req, res) => {
  const list = await Attendance.find({ status: "PENDING", endAt: { $ne: null } })
    .sort({ endAt: -1 })
    .limit(200)
    .populate("worker");
  res.json({ items: list });
});

const approveAttendanceSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"])
});

adminRouter.post("/attendance/:id/decision", parseBody(approveAttendanceSchema), async (req, res) => {
  const admin = await getAdmin(req);
  const att = await Attendance.findById(req.params.id).populate("worker");
  if (!att) return res.status(404).json({ error: "Attendance not found" });

  if (!att.endAt) return res.status(400).json({ error: "Cannot decide on running shift" });

  if (att.status !== "PENDING") return res.status(400).json({ error: "Already decided" });

  const worker = att.worker;
  const workedMs = att.endAt.getTime() - att.startAt.getTime();
  const basePay = computeBasePayForAttendance(worker.monthlySalary, workedMs);

  if (req.body.action === "APPROVE") {
    att.status = "APPROVED";
    att.approvedAt = nowUtc();
    att.approvedBy = admin._id;
    att.approvedBasePay = basePay;

    await notifyWorker(worker._id, "Attendance approved", "Your attendance was approved", { attendanceId: att._id.toString() });
  } else {
    att.status = "REJECTED";
    att.approvedAt = nowUtc();
    att.approvedBy = admin._id;
    att.approvedBasePay = 0;

    await notifyWorker(worker._id, "Attendance rejected", "Your attendance was rejected", { attendanceId: att._id.toString() });
  }

  await att.save();
  res.json({ attendance: att });
});

// Overtime pending
adminRouter.get("/overtime/pending", async (req, res) => {
  const list = await Overtime.find({ status: "PENDING" }).sort({ requestedAt: -1 }).limit(200).populate("worker");
  res.json({ items: list });
});

const otDecisionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"])
});

adminRouter.post("/overtime/:id/decision", parseBody(otDecisionSchema), async (req, res) => {
  const admin = await getAdmin(req);
  const ot = await Overtime.findById(req.params.id).populate("worker");
  if (!ot) return res.status(404).json({ error: "Overtime not found" });

  if (ot.status !== "PENDING") return res.status(400).json({ error: "Already decided" });

  if (req.body.action === "APPROVE") {
    ot.status = "APPROVED";
    ot.decidedAt = nowUtc();
    ot.decidedBy = admin._id;
    ot.autoApproved = false;
    ot.otStartAt = nowUtc();

    await notifyWorker(ot.worker._id, "Overtime approved", "Overtime started", { overtimeId: ot._id.toString() });
  } else {
    ot.status = "REJECTED";
    ot.decidedAt = nowUtc();
    ot.decidedBy = admin._id;
    ot.autoApproved = false;

    await notifyWorker(ot.worker._id, "Overtime rejected", "Overtime request was rejected", { overtimeId: ot._id.toString() });
  }

  await ot.save();
  res.json({ overtime: ot });
});

// End OT (admin can force)
adminRouter.post("/overtime/:id/end", async (req, res) => {
  const ot = await Overtime.findById(req.params.id).populate("worker");
  if (!ot) return res.status(404).json({ error: "Overtime not found" });
  if (ot.status !== "APPROVED" || !ot.otStartAt) return res.status(400).json({ error: "Overtime not running" });
  if (ot.otEndAt) return res.status(400).json({ error: "Overtime already ended" });

  ot.otEndAt = nowUtc();
  const otMs = ot.otEndAt.getTime() - ot.otStartAt.getTime();
  ot.estimatedOtPay = computeOtPay(ot.worker.monthlySalary, otMs);

  await ot.save();
  await notifyWorker(ot.worker._id, "Overtime ended", "Overtime ended", { overtimeId: ot._id.toString() });
  res.json({ overtime: ot });
});

// Leave pending
adminRouter.get("/leave/pending", async (req, res) => {
  const list = await LeaveRequest.find({ status: "PENDING" }).sort({ createdAt: -1 }).limit(200).populate("worker");
  res.json({ items: list });
});

const leaveDecisionSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"])
});

adminRouter.post("/leave/:id/decision", parseBody(leaveDecisionSchema), async (req, res) => {
  const admin = await getAdmin(req);
  const leave = await LeaveRequest.findById(req.params.id).populate("worker");
  if (!leave) return res.status(404).json({ error: "Leave not found" });

  if (leave.status !== "PENDING") return res.status(400).json({ error: "Already decided" });

  if (req.body.action === "ACCEPT") {
    leave.status = "ACCEPTED";
    leave.decidedAt = nowUtc();
    leave.decidedBy = admin._id;
    leave.deductionSar = 0;

    await notifyWorker(leave.worker._id, "Leave accepted", `Leave accepted for ${leave.leaveDate}`, { leaveId: leave._id.toString() });
  } else {
    leave.status = "REJECTED";
    leave.decidedAt = nowUtc();
    leave.decidedBy = admin._id;
    leave.deductionSar = 100;

    await notifyWorker(leave.worker._id, "Leave rejected", `Leave rejected for ${leave.leaveDate}`, { leaveId: leave._id.toString() });
  }

  await leave.save();
  res.json({ leave });
});

// Notifications inbox (admin)
adminRouter.get("/notifications", async (req, res) => {
  const list = await Notification.find({ toRole: "ADMIN" }).sort({ createdAt: -1 }).limit(300);
  res.json({ items: list });
});

adminRouter.post("/notifications/read-all", async (req, res) => {
  await Notification.updateMany({ toRole: "ADMIN", readAt: null }, { $set: { readAt: nowUtc() } });
  res.json({ ok: true });
});

/**
 * Salary Sheet PDF (simple month range by date)
 * Query params:
 * - workerId (mongo id)
 * - from=YYYY-MM-DD
 * - to=YYYY-MM-DD
 */
adminRouter.get("/salary/pdf", async (req, res) => {
  const worker = await Worker.findById(req.query.workerId);
  if (!worker) return res.status(404).json({ error: "Worker not found" });

  const from = String(req.query.from || "");
  const to = String(req.query.to || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return res.status(400).json({ error: "Invalid from/to (YYYY-MM-DD)" });
  }

  const fromDate = new Date(from + "T00:00:00.000Z");
  const toDate = new Date(to + "T23:59:59.999Z");

  const attendances = await Attendance.find({
    worker: worker._id,
    status: "APPROVED",
    endAt: { $ne: null },
    startAt: { $gte: fromDate, $lte: toDate }
  });

  const otList = await Overtime.find({
    worker: worker._id,
    status: "APPROVED",
    otStartAt: { $ne: null },
    requestedAt: { $gte: fromDate, $lte: toDate }
  });

  const leaves = await LeaveRequest.find({
    worker: worker._id,
    status: "REJECTED",
    createdAt: { $gte: fromDate, $lte: toDate }
  });

  const baseApproved = attendances.reduce((s, a) => s + (a.approvedBasePay || 0), 0);
  const otApproved = otList.reduce((s, o) => s + (o.approvedOtPay || 0), 0);
  const leaveDeductions = leaves.reduce((s, l) => s + (l.deductionSar || 0), 0);
  const net = baseApproved + otApproved - leaveDeductions;

  const pdf = await makeSalaryPdf({
    title: "Salary Sheet",
    worker,
    periodLabel: `${from} to ${to}`,
    rows: [
      { label: "Approved attendance records", value: String(attendances.length) },
      { label: "Approved overtime records", value: String(otList.length) },
      { label: "Rejected leaves", value: String(leaves.length) }
    ],
    totals: { baseApproved, otApproved, leaveDeductions, net }
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="salary_${worker.workerId}_${from}_${to}.pdf"`);
  res.send(pdf);
});
