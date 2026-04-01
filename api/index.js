import serverless from "serverless-http";
import app, { ensureDbAndSeed } from "../server/app.js";

let ready;
function init() {
  if (!ready) ready = ensureDbAndSeed();
  return ready;
}

const handler = serverless(app);

export default async function (req, res) {
  await init();
  return handler(req, res);
}
