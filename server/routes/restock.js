import { Router } from "express";
import { z } from "zod";
import { RestockQueue } from "../models/RestockQueue.js";
import { Product } from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";
import { syncRestockQueue } from "../utils/restock.js";

const router = Router();

router.use(requireAuth());

router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const items = await RestockQueue.find({ userId: req.user.id })
    .populate("productId")
    .lean();
  items.sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 3;
    const pb = priorityOrder[b.priority] ?? 3;
    if (pa !== pb) return pa - pb;
    const sa = a.productId?.stock ?? 0;
    const sb = b.productId?.stock ?? 0;
    return sa - sb;
  });
  const total = items.length;
  const slice = items.slice((page - 1) * limit, page * limit);
  res.json({ items: slice, total, page, limit });
});

router.patch("/:productId/restock", async (req, res) => {
  const schema = z.object({ quantity: z.number().int().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const product = await Product.findOne({ _id: req.params.productId, userId: req.user.id });
  if (!product) return res.status(404).json({ error: "Product not found" });

  product.stock += parsed.data.quantity;
  product.status = product.stock === 0 ? "out_of_stock" : "active";
  await product.save();
  await syncRestockQueue({ product, userId: req.user.id });

  await logActivity(req.user.id, `Stock updated for "${product.name}"`, { type: "restock", id: product._id });

  const populated = await Product.findById(product._id).populate("categoryId", "name").lean();
  res.json(populated);
});

router.delete("/:productId", async (req, res) => {
  const entry = await RestockQueue.findOneAndDelete({
    productId: req.params.productId,
    userId: req.user.id,
  });
  if (!entry) return res.status(404).json({ error: "Not in queue" });
  const product = await Product.findById(req.params.productId).lean();
  await logActivity(
    req.user.id,
    product ? `Removed "${product.name}" from restock queue` : "Item removed from restock queue",
    { type: "restock" }
  );
  res.json({ ok: true });
});

export default router;
