import dotenv from "dotenv";
dotenv.config();

function reqEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const ENVW = {
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: reqEnv("MONGODB_URI"),
  TICK_SECONDS: Number(process.env.TICK_SECONDS || 30)
};
