import express from "express";
import cors from "cors";
import morgan from "morgan";
import { ENV } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { authRouter } from "./routes/auth.routes.js";
import { workerRouter } from "./routes/worker.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { feedRouter } from "./routes/feed.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

async function main() {
  await connectDb();
  const app = express();

  app.use(cors({ origin: ENV.CORS_ORIGIN === "*" ? true : ENV.CORS_ORIGIN }));
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("tiny"));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/worker", workerRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/feed", feedRouter);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(ENV.PORT, () => {
    console.log(`backend-api running on port ${ENV.PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
