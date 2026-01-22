import { Attendance } from "../models/Attendance.js";
import { Overtime } from "../models/Overtime.js";
import { Worker } from "../models/Worker.js";
import { nowUtc, HOUR_MS, MIN_MS, addMs } from "../utils/time.js";
import { notifyAdmins, notifyWorker } from "./notifications.service.js";
import { computeBasePayForAttendance, computeOtPay } from "./salary.service.js";

/**
 * Locked rules:
 * - Daily fixed work hours = 10h
 * - After 10h completion: notify, 5-min window (end job or apply overtime)
 * - If no action in 5 min => shift auto-end
 * - OT request: admin has 5 min to approve/reject; if no action => OT auto-approved and started
 * - Max OT per day = 4h => auto-end OT at 4h
 *
 * This worker runs periodically and enforces all timers server-side.
 */

export async function tickTimers() {
  const now = nowUtc();

  // 1) Mark shiftCompletedAt when running shift crosses 10 hours
  const running = await Attendance.find({ endAt: null });
  for (const att of running) {
    const elapsedMs = now.getTime() - att.startAt.getTime();

    if (!att.shiftCompletedAt && elapsedMs >= 10 * HOUR_MS) {
      att.shiftCompletedAt = now;
      await att.save();

      await notifyWorker(att.worker, "Shift completed", "Shift completed, end job or apply overtime", {
        attendanceId: att._id.toString()
      });
      await notifyAdmins("Shift completed", "A worker shift reached 10 hours", {
        attendanceId: att._id.toString()
      });
    }

    // 2) Auto-end shift 5 min after shiftCompletedAt if worker did nothing
    if (att.shiftCompletedAt && !att.overtimeRequested) {
      const due = addMs(att.shiftCompletedAt, 5 * MIN_MS);
      if (now >= due) {
        // auto end
        att.endAt = now;
        att.autoEnded = true;

        const worker = await Worker.findById(att.worker);
        const workedMs = att.endAt.getTime() - att.startAt.getTime();
        if (worker) {
          att.estimatedBasePay = computeBasePayForAttendance(worker.monthlySalary, workedMs);
        }

        await att.save();

        await notifyWorker(att.worker, "Auto end", "Shift auto-ended due to no action", {
          attendanceId: att._id.toString()
        });
        await notifyAdmins("Auto end", "Shift auto-ended due to no worker action", {
          attendanceId: att._id.toString()
        });
      }
    }
  }

  // 3) Auto-approve overtime after admin decision window passes
  const pendingOt = await Overtime.find({ status: "PENDING" });
  for (const ot of pendingOt) {
    if (now >= ot.decisionDueAt) {
      ot.status = "APPROVED";
      ot.decidedAt = now;
      ot.autoApproved = true;
      ot.otStartAt = now;
      await ot.save();

      await notifyWorker(ot.worker, "Overtime auto-approved", "Overtime started automatically", {
        overtimeId: ot._id.toString()
      });
      await notifyAdmins("Overtime auto-approved", "Overtime auto-approved due to no admin action", {
        overtimeId: ot._id.toString()
      });
    }
  }

  // 4) Auto-end overtime at 4 hours max
  const runningOt = await Overtime.find({ status: "APPROVED", otStartAt: { $ne: null }, otEndAt: null });
  for (const ot of runningOt) {
    const otElapsed = now.getTime() - ot.otStartAt.getTime();
    if (otElapsed >= 4 * HOUR_MS) {
      ot.otEndAt = now;
      ot.autoEnded = true;

      const worker = await Worker.findById(ot.worker);
      if (worker) {
        const pay = computeOtPay(worker.monthlySalary, otElapsed);
        ot.estimatedOtPay = pay;
        // approvedOtPay should be set when admin approves OT record for payroll (if you add extra step)
        // For now, since OT itself is approved, we can treat estimated as approved:
        ot.approvedOtPay = pay;
      }

      await ot.save();

      await notifyWorker(ot.worker, "Overtime auto-ended", "Overtime auto-ended at maximum limit", {
        overtimeId: ot._id.toString()
      });
      await notifyAdmins("Overtime auto-ended", "Overtime auto-ended at 4 hours limit", {
        overtimeId: ot._id.toString()
      });
    }
  }
}
