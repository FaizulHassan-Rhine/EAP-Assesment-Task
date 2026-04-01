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

// Quick ping — no DB needed, confirms the serverless function is alive
app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Connect DB before every request (cached after first connect)
app.use(async (_req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(503).json({ error: "Database unavailable. Please try again." });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/restock", restockRoutes);
app.use("/api/activity", activityRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

// Seed demo user in background — does NOT block startup
export function seedDemoUser() {
  const demoEmail = "demo@inventory.local";
  connectDb()
    .then(() => User.findOne({ email: demoEmail }))
    .then(async (existing) => {
      if (!existing) {
        const passwordHash = await bcrypt.hash("demo123", 10);
        await User.create({ email: demoEmail, passwordHash, name: "Demo User", role: "admin" });
        console.log("Seeded demo user:", demoEmail, "/ demo123");
      }
    })
    .catch((err) => console.error("Demo seed error:", err.message));
}

export default app;
