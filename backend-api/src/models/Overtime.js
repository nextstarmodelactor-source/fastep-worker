import mongoose from "mongoose";

const OvertimeSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", index: true, required: true },
    attendance: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", index: true, required: true },

    requestedAt: { type: Date, required: true },
    decisionDueAt: { type: Date, required: true }, // requestedAt + 5 min

    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    decidedAt: { type: Date, default: null },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    autoApproved: { type: Boolean, default: false },

    // Actual OT run:
    otStartAt: { type: Date, default: null },
    otEndAt: { type: Date, default: null },
    autoEnded: { type: Boolean, default: false },

    estimatedOtPay: { type: Number, default: 0 },
    approvedOtPay: { type: Number, default: 0 }
  },
  { timestamps: true }
);

OvertimeSchema.index({ worker: 1, requestedAt: -1 });

export const Overtime = mongoose.model("Overtime", OvertimeSchema);
