import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", index: true, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, default: null },

    autoEnded: { type: Boolean, default: false },

    shiftCompletedAt: { type: Date, default: null },

    overtimeRequested: { type: Boolean, default: false },
    overtimeRequestAt: { type: Date, default: null },

    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    approvedAt: { type: Date, default: null },

    estimatedBasePay: { type: Number, default: 0 },
    approvedBasePay: { type: Number, default: 0 },

    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

AttendanceSchema.index({ worker: 1, startAt: -1 });

export const Attendance = mongoose.model("Attendance", AttendanceSchema);
