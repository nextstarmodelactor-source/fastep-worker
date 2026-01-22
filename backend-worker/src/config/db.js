import mongoose from "mongoose";
import { ENVW } from "./env.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(ENVW.MONGODB_URI);
  return mongoose.connection;
}
