import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
export async function getCategories({
  page = 1,
  limit = 20,
  search,
  includeInactive = false,
}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (!includeInactive) filter.isActive = true;
  if (search) filter.categoryName = { $regex: search, $options: "i" };
  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort({ categoryName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Category.countDocuments(filter),
  ]);
  return {
    categories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
export async function createCategory(data) {
  const escaped = data.categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existing = await Category.findOne({
    categoryName: { $regex: `^${escaped}$`, $options: "i" },
  });
  if (existing)
    throw { status: 409, message: "A category with this name already exists" };
  return await Category.create(data);
}
export async function updateCategory(id, data) {
  if (data.categoryName) {
    const escaped = data.categoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Category.findOne({
      categoryName: { $regex: `^${escaped}$`, $options: "i" },
      _id: { $ne: id },
    });
    if (existing)
      throw {
        status: 409,
        message: "A category with this name already exists",
      };
  }
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!category) throw { status: 404, message: "Category not found" };
  return category;
}
export async function deleteCategory(id) {
  const productCount = await Product.countDocuments({
    category: id,
    isActive: true,
  });
  if (productCount > 0)
    throw {
      status: 400,
      message: `Cannot delete: ${productCount} active product(s) associated.`,
    };
  const category = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!category) throw { status: 404, message: "Category not found" };
  return category;
}
export async function getCategoryById(id) {
  const category = await Category.findById(id).lean();
  if (!category) throw { status: 404, message: "Category not found" };
  return category;
}
