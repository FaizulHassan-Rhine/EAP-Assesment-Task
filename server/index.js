import dotenv from "dotenv";
import app, { ensureDbAndSeed } from "./app.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const PORT = process.env.PORT || 5000;

ensureDbAndSeed()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
