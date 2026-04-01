import serverless from "serverless-http";
import app, { seedDemoUser } from "../server/app.js";

// Seed demo user once in background (non-blocking)
seedDemoUser();

const handler = serverless(app);

export default async function (req, res) {
  return handler(req, res);
}
