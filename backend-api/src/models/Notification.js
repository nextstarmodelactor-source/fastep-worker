import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    toRole: { type: String, enum: ["WORKER", "ADMIN"], required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", default: null },
    title: { type: String, required: true },
    body: { type: String, required: true },
    meta: { type: Object, default: {} },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

NotificationSchema.index({ toRole: 1, createdAt: -1 });
NotificationSchema.index({ worker: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
