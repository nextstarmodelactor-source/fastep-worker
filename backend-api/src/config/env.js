import dotenv from "dotenv";
dotenv.config();

function reqEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 8080),
  MONGODB_URI: reqEnv("MONGODB_URI"),
  JWT_SECRET: reqEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  APP_TZ: process.env.APP_TZ || "Asia/Riyadh",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*"
};
