import Worker from "../models/worker.model.js";
import Attendance from "../models/attendance.model.js";
import Leave from "../models/leave.model.js";

export function startTimers() {
  console.log("⏳ Timers service started");

  setInterval(async () => {
    const now = new Date();

    // ===== AUTO END SHIFT AFTER 10H + 5 MIN WINDOW =====
    const running = await Attendance.find({ status: "RUNNING" });

    for (const att of running) {
      const start = new Date(att.startTime);
      const diffHours = (now - start) / (1000 * 60 * 60);

      // After 10 hours -> mark completedWaiting
      if (diffHours >= 10 && !att.waitingForOT) {
        att.waitingForOT = true;
        att.waitingStartedAt = now;
        await att.save();
      }

      // After 10h + 5min no response → auto end
      if (att.waitingForOT) {
        const waitDiff = (now - new Date(att.waitingStartedAt)) / (1000 * 60);
        if (waitDiff >= 5) {
          att.status = "COMPLETED";
          att.endTime = now;
          att.waitingForOT = false;
          await att.save();
        }
      }
    }

    // ===== AUTO APPROVE OT IF ADMIN NO ACTION IN 5 MIN =====
    const otPending = await Attendance.find({ otStatus: "PENDING" });

    for (const att of otPending) {
      const reqTime = new Date(att.otRequestedAt);
      const diffMin = (now - reqTime) / (1000 * 60);

      if (diffMin >= 5) {
        att.otStatus = "APPROVED";
        att.otStartTime = now;
        await att.save();
      }
    }

    // ===== AUTO END OT AFTER 4 HOURS =====
    const otRunning = await Attendance.find({ otStatus: "RUNNING" });

    for (const att of otRunning) {
      const otStart = new Date(att.otStartTime);
      const diffHr = (now - otStart) / (1000 * 60 * 60);

      if (diffHr >= 4) {
        att.otStatus = "COMPLETED";
        att.otEndTime = now;
        await att.save();
      }
    }

  }, 30000); // Runs every 30 seconds
}
