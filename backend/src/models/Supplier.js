import mongoose from "mongoose";
const supplierSchema = new mongoose.Schema(
  {
    supplierName: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      maxlength: 100,
    },
    contactPerson: { type: String, trim: true, default: "" },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Valid email required"],
      default: "",
    },
    phoneNumber: { type: String, trim: true, default: "" },
    companyName: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
supplierSchema.index({ supplierName: 1 });
export const Supplier = mongoose.model("Supplier", supplierSchema);
