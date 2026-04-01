import { RestockQueue } from "../models/RestockQueue.js";
import { logActivity } from "./activity.js";

export function computePriority(stock, minThreshold) {
  if (minThreshold <= 0) return "low";
  const ratio = stock / minThreshold;
  if (stock === 0 || ratio < 0.25) return "high";
  if (ratio < 0.5) return "medium";
  return "low";
}

export async function syncRestockQueue({ product, userId }) {
  const { stock, minThreshold, _id, name } = product;
  if (stock >= minThreshold) {
    await RestockQueue.deleteOne({ productId: _id, userId });
    return;
  }
  const priority = computePriority(stock, minThreshold);
  const existing = await RestockQueue.findOne({ productId: _id, userId });
  await RestockQueue.findOneAndUpdate(
    { productId: _id, userId },
    {
      $set: {
        priority,
        stockAtEnqueue: stock,
      },
    },
    { upsert: true, new: true }
  );
  if (!existing && name) {
    await logActivity(userId, `Product "${name}" added to Restock Queue`, {
      type: "restock",
      productId: _id,
    });
  }
}
