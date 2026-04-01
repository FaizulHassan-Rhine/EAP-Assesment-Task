import dotenv from "dotenv";
import app, { seedDemoUser } from "./app.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
  seedDemoUser();
});
