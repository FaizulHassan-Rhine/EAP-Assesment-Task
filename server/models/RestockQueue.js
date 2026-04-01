import mongoose from "mongoose";

const restockSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    priority: { type: String, enum: ["high", "medium", "low"], required: true },
    stockAtEnqueue: { type: Number, required: true },
  },
  { timestamps: true }
);

restockSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const RestockQueue = mongoose.models.RestockQueue || mongoose.model("RestockQueue", restockSchema);
