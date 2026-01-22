import mongoose from "mongoose";

const WorkerSchema = new mongoose.Schema(
  {
    workerId: { type: String, index: true },
    name: String,
    trade: String,
    phone: String,
    monthlySalary: Number,
    isActive: Boolean
  },
  { timestamps: true }
);

export const Worker = mongoose.model("Worker", WorkerSchema);
