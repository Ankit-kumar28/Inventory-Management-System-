import mongoose from "mongoose";
import { TRANSACTION_TYPES } from "../constants/index.js";
const stockTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    transactionType: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    quantity: { type: Number, required: true, min: [1, "Must be at least 1"] },
    unitPrice: { type: Number, min: 0, default: 0 },
    referenceNumber: { type: String, trim: true, default: "" },
    reason: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "", maxlength: 500 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
stockTransactionSchema.index({ product: 1, createdAt: -1 });
stockTransactionSchema.index({ transactionType: 1 });
stockTransactionSchema.index({ createdAt: -1 });
export const StockTransaction = mongoose.model(
  "StockTransaction",
  stockTransactionSchema,
);
