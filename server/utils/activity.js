import { ActivityLog } from "../models/ActivityLog.js";

export async function logActivity(userId, message, meta = {}) {
  await ActivityLog.create({ userId, message, meta });
}
