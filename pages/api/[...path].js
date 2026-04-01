import app from "../../server/app.js";
import { seedDemoUser } from "../../server/app.js";

// Seed demo user once on first cold start (non-blocking)
seedDemoUser();

// Disable Next.js body parsing — Express handles it
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
  // Pass request directly to Express
  app(req, res);
}
