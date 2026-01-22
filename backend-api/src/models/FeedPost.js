import mongoose from "mongoose";

const FeedPostSchema = new mongoose.Schema(
  {
    authorRole: { type: String, enum: ["WORKER", "ADMIN"], required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", default: null },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },

    text: { type: String, default: "" },
    photoUrl: { type: String, default: "" },

    isApproved: { type: Boolean, default: true } // admin can moderate; workers posts could be set false if you want
  },
  { timestamps: true }
);

FeedPostSchema.index({ createdAt: -1 });

export const FeedPost = mongoose.model("FeedPost", FeedPostSchema);
