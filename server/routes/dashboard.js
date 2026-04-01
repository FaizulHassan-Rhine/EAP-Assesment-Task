import { Router } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth());

router.get("/stats", async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const uid = req.user.id;
  const [ordersToday, pending, completed, revenueAgg, lowStockProducts] = await Promise.all([
    Order.countDocuments({ userId, createdAt: { $gte: start, $lt: end } }),
    Order.countDocuments({ userId, status: { $in: ["pending", "confirmed"] } }),
    Order.countDocuments({ userId, status: { $in: ["shipped", "delivered"] } }),
    Order.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: start, $lt: end },
          status: { $in: ["confirmed", "shipped", "delivered"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Product.find({
      userId: uid,
      $expr: { $lt: ["$stock", "$minThreshold"] },
    })
      .populate("categoryId", "name")
      .sort({ stock: 1 })
      .limit(10)
      .lean(),
  ]);

  const revenueToday = revenueAgg[0]?.total ?? 0;
  const lowStockCount = await Product.countDocuments({
    userId: uid,
    $expr: { $lt: ["$stock", "$minThreshold"] },
  });

  const productSummary = lowStockProducts.map((p) => ({
    id: p._id,
    name: p.name,
    stock: p.stock,
    minThreshold: p.minThreshold,
    label: p.stock < p.minThreshold ? (p.stock === 0 ? "Out of Stock" : "Low Stock") : "OK",
  }));

  const last7 = new Date();
  last7.setDate(last7.getDate() - 7);
  const chart = await Order.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: last7 },
        status: { $nin: ["cancelled"] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    ordersToday,
    pendingOrders: pending,
    completedOrders: completed,
    lowStockCount,
    revenueToday,
    productSummary,
    chart,
  });
});

export default router;
