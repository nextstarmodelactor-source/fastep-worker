import { Attendance } from "../models/Attendance.js";

/**
 * FASTEP WORK Timers Engine (runs server-side)
 * - 10h shift completion → OT window starts
 * - 5 min response window → auto end shift
 * - OT request pending → auto approve after 5 min
 * - OT running → auto end after 4 hours
 *
 * NOTE:
 * This file assumes Attendance fields exist:
 * - status: "RUNNING" | "COMPLETED" | ...
 * - startTime, endTime
 * - waitingForOT (boolean)
 * - waitingStartedAt (date)
 * - otStatus: "PENDING" | "APPROVED" | "RUNNING" | "COMPLETED" | "REJECTED"
 * - otRequestedAt, otStartTime, otEndTime
 *
 * If your field names differ, tell me your Attendance schema and I will map it.
 */

export function startTimers() {
  console.log("⏳ Timers service started");

  // Avoid double start in case of hot reload / duplicate calls
  if (globalThis.__FASTEP_TIMERS_STARTED__) return;
  globalThis.__FASTEP_TIMERS_STARTED__ = true;

  setInterval(async () => {
    try {
      const now = new Date();

      // ======================================================
      // 1) SHIFT RUNNING: after 10h start OT decision window
      // ======================================================
      const runningShifts = await Attendance.find({ status: "RUNNING" });

      for (const att of runningShifts) {
        // If startTime missing, skip safely
        if (!att.startTime) continue;

        const start = new Date(att.startTime);
        const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);

        // After 10 hours, mark waiting window start (only once)
        if (diffHours >= 10 && !att.waitingForOT) {
          att.waitingForOT = true;
          att.waitingStartedAt = now;
          await att.save();
          continue;
        }

        // If waiting window active -> after 5 min auto end shift
        if (att.waitingForOT && att.waitingStartedAt) {
          const waitStart = new Date(att.waitingStartedAt);
          const waitDiffMin =
            (now.getTime() - waitStart.getTime()) / (1000 * 60);

          if (waitDiffMin >= 5) {
            att.status = "COMPLETED";
            att.endTime = now;
            att.waitingForOT = false;
            att.waitingStartedAt = null;
            await att.save();
          }
        }
      }

      // ======================================================
      // 2) OT REQUEST: auto approve if admin no action in 5 min
      // ======================================================
      const otPending = await Attendance.find({ otStatus: "PENDING" });

      for (const att of otPending) {
        if (!att.otRequestedAt) continue;

        const req = new Date(att.otRequestedAt);
        const diffMin = (now.getTime() - req.getTime()) / (1000 * 60);

        if (diffMin >= 5) {
          // Auto approve + start OT
          att.otStatus = "RUNNING"; // start running immediately after auto-approve
          att.otStartTime = now;
          await att.save();
        }
      }

      // ======================================================
      // 3) OT RUNNING: auto end at 4 hours max
      // ======================================================
      const otRunning = await Attendance.find({ otStatus: "RUNNING" });

      for (const att of otRunning) {
        if (!att.otStartTime) continue;

        const otStart = new Date(att.otStartTime);
        const diffHr = (now.getTime() - otStart.getTime()) / (1000 * 60 * 60);

        if (diffHr >= 4) {
          att.otStatus = "COMPLETED";
          att.otEndTime = now;
          await att.save();
        }
      }
    } catch (e) {
      console.error("Timers error:", e?.message || e);
    }
  }, 30_000);
}
