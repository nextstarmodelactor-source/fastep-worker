import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", index: true, required: true },

    startAt: { type: Date, required: true },
    endAt: { type: Date, default: null },

    // Server authority flags:
    autoEnded: { type: Boolean, default: false },

    // 10-hour completion marker:
    shiftCompletedAt: { type: Date, default: null },

    // Worker action after 10h:
    overtimeRequested: { type: Boolean, default: false },
    overtimeRequestAt: { type: Date, default: null },

    // Admin approval of attendance:
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },

    // Computed amounts snapshot (for transparency)
    estimatedBasePay: { type: Number, default: 0 },
    approvedBasePay: { type: Number, default: 0 },

    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

AttendanceSchema.index({ worker: 1, startAt: -1 });

export const Attendance = mongoose.model("Attendance", AttendanceSchema);
