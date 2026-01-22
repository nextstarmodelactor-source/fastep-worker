import { Notification } from "../models/Notification.js";

export async function notifyWorker(workerId, title, body, meta = {}) {
  await Notification.create({
    toRole: "WORKER",
    worker: workerId,
    title,
    body,
    meta
  });
}

export async function notifyAdmins(title, body, meta = {}) {
  await Notification.create({
    toRole: "ADMIN",
    title,
    body,
    meta
  });
}
