import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import categoriesRoutes from "./routes/categories.js";
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";
import restockRoutes from "./routes/restock.js";
import activityRoutes from "./routes/activity.js";
import { connectDb } from "./db.js";
import { User } from "./models/User.js";
import bcrypt from "bcryptjs";

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/restock", restockRoutes);
app.use("/api/activity", activityRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

export async function ensureDbAndSeed() {
  await connectDb();
  const demoEmail = "demo@inventory.local";
  const existing = await User.findOne({ email: demoEmail });
  if (!existing) {
    const passwordHash = await bcrypt.hash("demo123", 10);
    await User.create({
      email: demoEmail,
      passwordHash,
      name: "Demo User",
      role: "admin",
    });
    console.log("Seeded demo user:", demoEmail, "/ demo123");
  }
}

export default app;
