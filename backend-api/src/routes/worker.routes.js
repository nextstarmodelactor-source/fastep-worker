import express from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Attendance } from "../models/Attendance.js";
import { Overtime } from "../models/Overtime.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { Worker } from "../models/Worker.js";
import { Notification } from "../models/Notification.js";
import { nowUtc, addMs, HOUR_MS, MIN_MS } from "../utils/time.js";
import { parseBody } from "../utils/validate.js";
import { computeBasePayForAttendance } from "../services/salary.service.js";
import { notifyAdmins, notifyWorker } from "../services/notifications.service.js";

export const workerRouter = express.Router();

workerRouter.use(requireAuth, requireRole("WORKER"));

async function getWorker(req) {
  const worker = await Worker.findById(req.auth.sub);
  if (!worker || !worker.isActive) {
    const err = new Error("Worker not found");
    err.status = 404;
    throw err;
  }
  return worker;
}

workerRouter.get("/me", async (req, res) => {
  const worker = await getWorker(req);
  res.json({
    id: worker._id,
    workerId: worker.workerId,
    name: worker.name,
    trade: worker.trade,
    phone: worker.phone,
    monthlySalary: worker.monthlySalary,
    photoUrl: worker.photoUrl
  });
});

// Dashboard: current open attendance + today summary
workerRouter.get("/dashboard", async (req, res) => {
  const worker = await getWorker(req);
  const open = await Attendance.findOne({ worker: worker._id, endAt: null }).sort({ startAt: -1 });

  let workedMs = 0;
  let status = "NOT_STARTED";
  if (open) {
    workedMs = (nowUtc().getTime() - open.startAt.getTime());
    if (open.shiftCompletedAt) status = open.overtimeRequested ? "OT_REQUESTED" : "SHIFT_COMPLETED";
    else status = "RUNNING";
  }

  res.json({
    openAttendance: open,
    workedMs,
    status
  });
});

// Start job: create new attendance if none open
workerRouter.post("/attendance/start", async (req, res) => {
  const worker = await getWorker(req);

  const existing = await Attendance.findOne({ worker: worker._id, endAt: null });
  if (existing) return res.status(400).json({ error: "Shift already running" });

  const startAt = nowUtc();
  const att = await Attendance.create({
    worker: worker._id,
    startAt,
    estimatedBasePay: 0,
    approvedBasePay: 0
  });

  await notifyAdmins("Shift started", `${worker.name} (${worker.workerId}) started shift`, {
    workerId: worker.workerId,
    attendanceId: att._id.toString()
  });

  res.json({ attendance: att });
});

// End job: close attendance
workerRouter.post("/attendance/end", async (req, res) => {
  const worker = await getWorker(req);

  const att = await Attendance.findOne({ worker: worker._id, endAt: null }).sort({ startAt: -1 });
  if (!att) return res.status(400).json({ error: "No running shift" });

  att.endAt = nowUtc();
  const workedMs = att.endAt.getTime() - att.startAt.getTime();

  // Estimated base pay up to 10 hours
  att.estimatedBasePay = computeBasePayForAttendance(worker.monthlySalary, workedMs);

  await att.save();

  await notifyAdmins("Attendance submitted", `${worker.name} submitted attendance for approval`, {
    workerId: worker.workerId,
    attendanceId: att._id.toString()
  });

  res.json({ attendance: att });
});

// Apply overtime (available after 10-hour completion)
workerRouter.post("/overtime/apply", async (req, res) => {
  const worker = await getWorker(req);

  const att = await Attendance.findOne({ worker: worker._id, endAt: null }).sort({ startAt: -1 });
  if (!att) return res.status(400).json({ error: "No running shift" });

  if (!att.shiftCompletedAt) return res.status(400).json({ error: "Overtime available after 10 hours" });
  if (att.overtimeRequested) return res.status(400).json({ error: "Overtime already requested" });

  const requestedAt = nowUtc();
  const decisionDueAt = addMs(requestedAt, 5 * MIN_MS);

  const ot = await Overtime.create({
    worker: worker._id,
    attendance: att._id,
    requestedAt,
    decisionDueAt,
    status: "PENDING"
  });

  att.overtimeRequested = true;
  att.overtimeRequestAt = requestedAt;
  await att.save();

  await notifyAdmins("Overtime request", `${worker.name} requested overtime`, {
    workerId: worker.workerId,
    overtimeId: ot._id.toString()
  });

  res.json({ overtime: ot });
});

// Leave apply
const leaveSchema = z.object({
  leaveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.enum(["Sick", "Emergency", "Family Problem", "Passport / Iqama Work", "Camp Issue", "Other"]),
  otherText: z.string().max(200).optional()
});

workerRouter.post("/leave/apply", parseBody(leaveSchema), async (req, res) => {
  const worker = await getWorker(req);
  const { leaveDate, reason, otherText = "" } = req.body;

  const exists = await LeaveRequest.findOne({ worker: worker._id, leaveDate });
  if (exists) return res.status(400).json({ error: "Leave already applied for this date" });

  const leave = await LeaveRequest.create({
    worker: worker._id,
    leaveDate,
    reason,
    otherText: reason === "Other" ? otherText : ""
  });

  await notifyAdmins("Leave request", `${worker.name} requested leave on ${leaveDate}`, {
    workerId: worker.workerId,
    leaveId: leave._id.toString()
  });

  res.json({ leave });
});

// Worker history
workerRouter.get("/attendance/history", async (req, res) => {
  const worker = await getWorker(req);
  const list = await Attendance.find({ worker: worker._id }).sort({ startAt: -1 }).limit(200);
  res.json({ items: list });
});

workerRouter.get("/overtime/history", async (req, res) => {
  const worker = await getWorker(req);
  const list = await Overtime.find({ worker: worker._id }).sort({ requestedAt: -1 }).limit(200);
  res.json({ items: list });
});

workerRouter.get("/leave/history", async (req, res) => {
  const worker = await getWorker(req);
  const list = await LeaveRequest.find({ worker: worker._id }).sort({ createdAt: -1 }).limit(200);
  res.json({ items: list });
});

// Notifications inbox (worker)
workerRouter.get("/notifications", async (req, res) => {
  const worker = await getWorker(req);
  const list = await Notification.find({ toRole: "WORKER", worker: worker._id }).sort({ createdAt: -1 }).limit(200);
  res.json({ items: list });
});

workerRouter.post("/notifications/read-all", async (req, res) => {
  const worker = await getWorker(req);
  await Notification.updateMany(
    { toRole: "WORKER", worker: worker._id, readAt: null },
    { $set: { readAt: nowUtc() } }
  );
  res.json({ ok: true });
});
