import express from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { FeedPost } from "../models/FeedPost.js";
import { Worker } from "../models/Worker.js";
import { Admin } from "../models/Admin.js";
import { parseBody } from "../utils/validate.js";

export const feedRouter = express.Router();

feedRouter.get("/", requireAuth, async (req, res) => {
  const items = await FeedPost.find({ isApproved: true })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("worker")
    .populate("admin");
  res.json({ items });
});

const createPostSchema = z.object({
  text: z.string().max(500).optional(),
  photoUrl: z.string().max(500).optional()
});

feedRouter.post("/", requireAuth, parseBody(createPostSchema), async (req, res) => {
  const { text = "", photoUrl = "" } = req.body;

  if (req.auth.role === "WORKER") {
    const w = await Worker.findById(req.auth.sub);
    if (!w) return res.status(404).json({ error: "Worker not found" });

    const post = await FeedPost.create({
      authorRole: "WORKER",
      worker: w._id,
      text,
      photoUrl,
      isApproved: true
    });

    return res.json({ post });
  }

  if (req.auth.role === "ADMIN") {
    const a = await Admin.findById(req.auth.sub);
    if (!a) return res.status(404).json({ error: "Admin not found" });

    const post = await FeedPost.create({
      authorRole: "ADMIN",
      admin: a._id,
      text,
      photoUrl,
      isApproved: true
    });

    return res.json({ post });
  }

  return res.status(403).json({ error: "Forbidden" });
});
