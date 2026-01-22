import { z } from "zod";

export function parseBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      return res.status(400).json({ error: "Invalid request", details: e.errors });
    }
  };
}

export const zPhone = z.string().min(6).max(30);
export const zWorkerId = z.string().min(2).max(30);
export const zPassword = z.string().min(4).max(200);
export const zEmail = z.string().email();
