import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 100,
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
categorySchema.index(
  { categoryName: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);
export const Category = mongoose.model("Category", categorySchema);
