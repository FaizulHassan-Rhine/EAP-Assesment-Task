import { Router } from "express";
import { z } from "zod";
import { Category } from "../models/Category.js";
import { requireAuth } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

router.use(requireAuth());

router.get("/", async (req, res) => {
  const q = req.query.search?.toString().trim();
  const filter = { userId: req.user.id };
  if (q) filter.name = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const [items, total] = await Promise.all([
    Category.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});

router.post("/", async (req, res) => {
  const schema = z.object({ name: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const cat = await Category.create({ name: parsed.data.name, userId: req.user.id });
    await logActivity(req.user.id, `Category "${cat.name}" created`, { type: "category", id: cat._id });
    res.status(201).json(cat);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: "Category name already exists" });
    throw e;
  }
});

router.patch("/:id", async (req, res) => {
  const schema = z.object({ name: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const cat = await Category.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { name: parsed.data.name },
    { new: true }
  );
  if (!cat) return res.status(404).json({ error: "Not found" });
  await logActivity(req.user.id, `Category "${cat.name}" updated`, { type: "category", id: cat._id });
  res.json(cat);
});

router.delete("/:id", async (req, res) => {
  const cat = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!cat) return res.status(404).json({ error: "Not found" });
  await logActivity(req.user.id, `Category "${cat.name}" deleted`, { type: "category" });
  res.json({ ok: true });
});

export default router;
