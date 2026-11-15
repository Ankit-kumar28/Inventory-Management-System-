import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Supplier } from "../models/Supplier.js";
import { StockTransaction } from "../models/StockTransaction.js";
export async function getProducts({
  page = 1,
  limit = 20,
  search,
  category,
  supplier,
  stockStatus,
  includeInactive = false,
  sortBy = "createdAt",
  sortOrder = "desc",
}) {
  const filter = {};
  if (!includeInactive) filter.isActive = true;
  if (search)
    filter.$or = [
      { productName: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  if (category) filter.category = category;
  if (supplier) filter.supplier = supplier;
  if (stockStatus === "out-of-stock") filter.quantity = 0;
  else if (stockStatus === "low-stock")
    filter.$expr = {
      $and: [
        { $gt: ["$minimumStockLevel", 0] },
        { $lte: ["$quantity", "$minimumStockLevel"] },
      ],
    };
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}
export async function createProduct(data) {
  const [catExists, suppExists] = await Promise.all([
    Category.findById(data.category),
    Supplier.findById(data.supplier),
  ]);
  if (!catExists) throw { status: 400, message: "Invalid category" };
  if (!suppExists) throw { status: 400, message: "Invalid supplier" };
  return await Product.create({ ...data, quantity: 0 });
}
export async function getProductById(id) {
  const product = await Product.findById(id)
    .populate("category", "categoryName")
    .populate("supplier", "supplierName")
    .lean();
  if (!product) throw { status: 404, message: "Product not found" };
  return product;
}
export async function updateProduct(id, data) {
  delete data.quantity;
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .populate("category", "categoryName")
    .populate("supplier", "supplierName");
  if (!product) throw { status: 404, message: "Product not found" };
  return product;
}
export async function deleteProduct(id) {
  const hasTransactions = await StockTransaction.exists({ product: id });
  if (hasTransactions) {
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!product) throw { status: 404, message: "Product not found" };
    return { product, archived: true };
  }
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw { status: 404, message: "Product not found" };
  return { product, archived: false };
}
