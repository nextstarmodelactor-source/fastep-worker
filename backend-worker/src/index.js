import { connectDb } from "./config/db.js";
import { ENVW } from "./config/env.js";
import { tickTimers } from "./services/timers.service.js";

async function main() {
  await connectDb();
  console.log("backend-worker connected to DB");

  const intervalMs = Math.max(5, ENVW.TICK_SECONDS) * 1000;

  // Run immediately then interval
  await tickTimers();
  setInterval(async () => {
    try {
      await tickTimers();
    } catch (e) {
      console.error("tick error", e);
    }
  }, intervalMs);

  console.log(`backend-worker running tick every ${ENVW.TICK_SECONDS}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
