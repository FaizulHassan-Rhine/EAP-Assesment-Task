import serverless from "serverless-http";
import app, { seedDemoUser } from "../server/app.js";

console.log("[api/index] module loaded, NODE_ENV:", process.env.NODE_ENV);
console.log("[api/index] MONGODB_URI set:", !!process.env.MONGODB_URI);
console.log("[api/index] JWT_SECRET set:", !!process.env.JWT_SECRET);

// Seed demo user once in background (non-blocking)
seedDemoUser();

const handler = serverless(app);

export default async function (req, res) {
  console.log("[api/index] incoming:", req.method, req.url);
  return handler(req, res);
}
