import { Product } from "../models/Product.js";
export async function getInventory({
  page = 1,
  limit = 20,
  search,
  category,
  supplier,
  stockStatus,
}) {
  const filter = { isActive: true };
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
  const pageNum = parseInt(page || 1);
  const limitNum = parseInt(limit || 20);
  const skip = (pageNum - 1) * limitNum;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .sort({ productName: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return {
    products,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
}
export async function getLowStockProducts() {
  return await Product.find({
    isActive: true,
    $expr: {
      $and: [
        { $gt: ["$minimumStockLevel", 0] },
        { $lte: ["$quantity", "$minimumStockLevel"] },
        { $gt: ["$quantity", 0] },
      ],
    },
  })
    .populate("category", "categoryName")
    .populate("supplier", "supplierName")
    .lean();
}
export async function getOutOfStockProducts() {
  return await Product.find({ isActive: true, quantity: 0 })
    .populate("category", "categoryName")
    .populate("supplier", "supplierName")
    .lean();
}
