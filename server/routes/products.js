import { Router } from "express";
import { z } from "zod";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { requireAuth } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";
import { syncRestockQueue } from "../utils/restock.js";

const router = Router();

router.use(requireAuth());

function normalizeProduct(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  return o;
}

router.get("/", async (req, res) => {
  const q = req.query.search?.toString().trim();
  const categoryId = req.query.categoryId?.toString();
  const status = req.query.status?.toString();
  const filter = { userId: req.user.id };
  if (q) filter.name = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (categoryId) filter.categoryId = categoryId;
  if (status && ["active", "out_of_stock"].includes(status)) filter.status = status;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("categoryId", "name")
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});

router.post("/", async (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    categoryId: z.string(),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative(),
    minThreshold: z.number().int().nonnegative(),
    isListed: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const cat = await Category.findOne({ _id: parsed.data.categoryId, userId: req.user.id });
  if (!cat) return res.status(400).json({ error: "Invalid category" });
  let status = parsed.data.stock === 0 ? "out_of_stock" : "active";
  const product = await Product.create({
    ...parsed.data,
    userId: req.user.id,
    status,
    isListed: parsed.data.isListed ?? true,
  });
  await syncRestockQueue({ product: normalizeProduct(product), userId: req.user.id });
  await logActivity(req.user.id, `Product "${product.name}" added`, { type: "product", id: product._id });
  const populated = await Product.findById(product._id).populate("categoryId", "name").lean();
  res.status(201).json(populated);
});

router.patch("/:id", async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).optional(),
    categoryId: z.string().optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    minThreshold: z.number().int().nonnegative().optional(),
    isListed: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const product = await Product.findOne({ _id: req.params.id, userId: req.user.id });
  if (!product) return res.status(404).json({ error: "Not found" });
  if (parsed.data.categoryId) {
    const cat = await Category.findOne({ _id: parsed.data.categoryId, userId: req.user.id });
    if (!cat) return res.status(400).json({ error: "Invalid category" });
    product.categoryId = parsed.data.categoryId;
  }
  Object.assign(product, parsed.data);
  if (parsed.data.stock !== undefined) {
    product.status = product.stock === 0 ? "out_of_stock" : "active";
  }
  await product.save();
  await syncRestockQueue({ product: normalizeProduct(product), userId: req.user.id });
  const stockRelated =
    parsed.data.stock !== undefined || parsed.data.minThreshold !== undefined;
  await logActivity(
    req.user.id,
    stockRelated
      ? `Stock updated for "${product.name}"`
      : `Product "${product.name}" updated`,
    { type: "product", id: product._id }
  );
  const populated = await Product.findById(product._id).populate("categoryId", "name").lean();
  res.json(populated);
});

router.delete("/:id", async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!product) return res.status(404).json({ error: "Not found" });
  await logActivity(req.user.id, `Product "${product.name}" deleted`, { type: "product" });
  res.json({ ok: true });
});

export default router;
