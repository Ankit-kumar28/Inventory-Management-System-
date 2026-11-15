import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: { type: String, trim: true, default: "", maxlength: 1000 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Cannot be negative"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Cannot be negative"],
    },
    quantity: { type: Number, default: 0, min: [0, "Cannot be negative"] },
    minimumStockLevel: {
      type: Number,
      default: 0,
      min: [0, "Cannot be negative"],
    },
    unit: { type: String, trim: true, default: "pcs" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ productName: "text", sku: "text" });
export const Product = mongoose.model("Product", productSchema);
