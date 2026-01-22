import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    toRole: { type: String, enum: ["WORKER", "ADMIN"], required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", default: null },
    title: String,
    body: String,
    meta: { type: Object, default: {} },
    readAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", NotificationSchema);
