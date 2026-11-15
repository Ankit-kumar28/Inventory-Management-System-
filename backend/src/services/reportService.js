import { Product } from "../models/Product.js";
import { StockTransaction } from "../models/StockTransaction.js";
function buildDateFilter(startDate, endDate) {
  const f = {};
  if (startDate) f.$gte = new Date(startDate);
  if (endDate) {
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    f.$lte = e;
  }
  return Object.keys(f).length ? f : null;
}
export async function getInventoryReport({
  page = 1,
  limit = 20,
  search,
  category,
  supplier,
}) {
  const skip = (page - 1) * limit;
  const filter = { isActive: true };
  if (search)
    filter.$or = [
      { productName: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  if (category) filter.category = category;
  if (supplier) filter.supplier = supplier;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .sort({ productName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}
export async function getTransactionReport({
  type,
  page = 1,
  limit = 20,
  startDate,
  endDate,
  product,
  category,
}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (type) filter.transactionType = type;
  if (product) filter.product = product;
  const df = buildDateFilter(startDate, endDate);
  if (df) filter.createdAt = df;
  const [transactions, total] = await Promise.all([
    StockTransaction.find(filter)
      .populate({
        path: "product",
        select: "productName sku unit category",
        populate: { path: "category", select: "categoryName" },
      })
      .populate("supplier", "supplierName")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    StockTransaction.countDocuments(filter),
  ]);
  return {
    transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
export async function getLowStockReport() {
  return await Product.find({
    isActive: true,
    $expr: {
      $and: [
        { $gt: ["$minimumStockLevel", 0] },
        { $lte: ["$quantity", "$minimumStockLevel"] },
      ],
    },
  })
    .populate("category", "categoryName")
    .populate("supplier", "supplierName")
    .sort({ quantity: 1 })
    .lean();
}
export async function getValuationReport({
  page = 1,
  limit = 20,
  category,
  supplier,
}) {
  const skip = (page - 1) * limit;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (supplier) filter.supplier = supplier;
  const [products, total, valuationAgg] = await Promise.all([
    Product.find(filter)
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .sort({ productName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$purchasePrice", "$quantity"] } },
        },
      },
    ]),
  ]);
  const productsWithValue = products.map((p) => ({
    ...p,
    totalValue: p.purchasePrice * p.quantity,
  }));
  return {
    products: productsWithValue,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    grandTotalValue: valuationAgg[0]?.totalValue || 0,
  };
}
