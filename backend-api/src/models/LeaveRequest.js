import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", index: true, required: true },

    leaveDate: { type: String, required: true }, // "YYYY-MM-DD"
    reason: {
      type: String,
      enum: ["Sick", "Emergency", "Family Problem", "Passport / Iqama Work", "Camp Issue", "Other"],
      required: true
    },
    otherText: { type: String, default: "" },

    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
    decidedAt: { type: Date, default: null },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },

    // salary rule: rejected = 100 SAR deduction
    deductionSar: { type: Number, default: 0 }
  },
  { timestamps: true }
);

LeaveRequestSchema.index({ worker: 1, leaveDate: -1 });

export const LeaveRequest = mongoose.model("LeaveRequest", LeaveRequestSchema);
