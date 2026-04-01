import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minThreshold: { type: Number, required: true, min: 0, default: 5 },
    status: { type: String, enum: ["active", "out_of_stock"], default: "active" },
    isListed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ userId: 1, name: 1 });

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
