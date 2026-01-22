import mongoose from "mongoose";

const OvertimeSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", index: true, required: true },
    attendance: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", index: true, required: true },

    requestedAt: { type: Date, required: true },
    decisionDueAt: { type: Date, required: true },

    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    decidedAt: { type: Date, default: null },
    autoApproved: { type: Boolean, default: false },

    otStartAt: { type: Date, default: null },
    otEndAt: { type: Date, default: null },
    autoEnded: { type: Boolean, default: false },

    estimatedOtPay: { type: Number, default: 0 },
    approvedOtPay: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Overtime = mongoose.model("Overtime", OvertimeSchema);
