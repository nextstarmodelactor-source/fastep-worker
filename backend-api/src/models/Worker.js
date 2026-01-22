import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const WorkerSchema = new mongoose.Schema(
  {
    workerId: { type: String, unique: true, index: true, required: true, trim: true },
    passwordHash: { type: String, required: true },

    name: { type: String, required: true, trim: true },
    trade: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    photoUrl: { type: String, default: "" },

    monthlySalary: { type: Number, required: true, min: 0 },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

WorkerSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

WorkerSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const Worker = mongoose.model("Worker", WorkerSchema);
