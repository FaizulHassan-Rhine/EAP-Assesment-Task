import { Router } from "express";
import { ActivityLog } from "../models/ActivityLog.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth());

router.get("/", async (req, res) => {
  const limit = Math.min(50, Math.max(5, parseInt(req.query.limit, 10) || 10));
  const items = await ActivityLog.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  res.json({ items });
});

export default router;
