import mongoose from "mongoose";
import { ENV } from "./env.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(ENV.MONGODB_URI);
  return mongoose.connection;
}
