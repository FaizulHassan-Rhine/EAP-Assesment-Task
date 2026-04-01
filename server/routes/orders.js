import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";
import { syncRestockQueue } from "../utils/restock.js";

const router = Router();

router.use(requireAuth());

async function restoreStockForOrder(order, userId) {
  for (const line of order.items) {
    const product = await Product.findById(line.productId);
    if (!product) continue;
    product.stock += line.quantity;
    product.status = product.stock === 0 ? "out_of_stock" : "active";
    await product.save();
    await syncRestockQueue({ product, userId });
  }
}

router.get("/", async (req, res) => {
  const status = req.query.status?.toString();
  const date = req.query.date?.toString();
  const q = req.query.search?.toString().trim();
  const filter = { userId: req.user.id };
  if (status && ["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status)) {
    filter.status = status;
  }
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }
  if (q) {
    filter.$or = [
      { customerName: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
    ];
    if (mongoose.Types.ObjectId.isValid(q)) filter.$or.push({ _id: q });
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ items, total, page, limit });
});

router.post("/", async (req, res) => {
  const itemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  });
  const schema = z.object({
    customerName: z.string().min(1),
    items: z.array(itemSchema).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const productIds = parsed.data.items.map((i) => i.productId);
  const unique = new Set(productIds);
  if (unique.size !== productIds.length) {
    return res.status(400).json({ error: "This product is already added to the order." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const lines = [];
    let totalPrice = 0;
    for (const line of parsed.data.items) {
      const product = await Product.findOne({ _id: line.productId, userId: req.user.id }).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Invalid product in order" });
      }
      if (!product.isListed) {
        await session.abortTransaction();
        return res.status(400).json({ error: 'This product is currently unavailable.' });
      }
      if (product.status !== "active") {
        await session.abortTransaction();
        return res.status(400).json({ error: 'This product is currently unavailable.' });
      }
      if (line.quantity > product.stock) {
        await session.abortTransaction();
        return res.status(400).json({
          error: `Only ${product.stock} items available in stock`,
          code: "INSUFFICIENT_STOCK",
          productId: product._id.toString(),
          available: product.stock,
        });
      }
      const unitPrice = product.price;
      const lineTotal = unitPrice * line.quantity;
      totalPrice += lineTotal;
      lines.push({
        productId: product._id,
        quantity: line.quantity,
        unitPrice,
        lineTotal,
      });
    }

    const updatedProducts = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const product = await Product.findById(line.productId).session(session);
      product.stock -= line.quantity;
      product.status = product.stock === 0 ? "out_of_stock" : "active";
      await product.save({ session });
      updatedProducts.push(product);
    }

    const order = await Order.create(
      [
        {
          customerName: parsed.data.customerName,
          userId: req.user.id,
          items: lines,
          totalPrice,
          status: "pending",
        },
      ],
      { session }
    );
    await session.commitTransaction();
    const created = order[0];
    for (const product of updatedProducts) {
      await syncRestockQueue({ product, userId: req.user.id });
    }
    await logActivity(req.user.id, `Order #${created._id.toString().slice(-6)} created`, {
      type: "order",
      orderId: created._id,
    });
    const populated = await Order.findById(created._id).populate("items.productId").lean();
    res.status(201).json(populated);
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
});

router.patch("/:id", async (req, res) => {
  const schema = z.object({
    status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
  if (!order) return res.status(404).json({ error: "Not found" });

  if (parsed.data.status === "cancelled" && order.status !== "cancelled") {
    await restoreStockForOrder(order, req.user.id);
    order.status = "cancelled";
    await order.save();
    await logActivity(req.user.id, `Order #${order._id.toString().slice(-6)} cancelled`, {
      type: "order",
      orderId: order._id,
    });
    const populated = await Order.findById(order._id).populate("items.productId").lean();
    return res.json(populated);
  }

  if (order.status === "cancelled") {
    return res.status(400).json({ error: "Cannot update a cancelled order" });
  }

  order.status = parsed.data.status;
  await order.save();
  await logActivity(req.user.id, `Order #${order._id.toString().slice(-6)} marked as ${parsed.data.status}`, {
    type: "order",
    orderId: order._id,
  });
  const populated = await Order.findById(order._id).populate("items.productId").lean();
  res.json(populated);
});

export default router;
