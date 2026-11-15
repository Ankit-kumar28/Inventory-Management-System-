import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Supplier } from "../models/Supplier.js";
import { StockTransaction } from "../models/StockTransaction.js";
export async function getDashboardStats() {
  const [
    totalProducts,
    totalCategories,
    totalSuppliers,
    stockAgg,
    lowStock,
    outOfStock,
    valuationAgg,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    Supplier.countDocuments({ isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalUnits: { $sum: "$quantity" } } },
    ]),
    Product.countDocuments({
      isActive: true,
      $expr: {
        $and: [
          { $gt: ["$minimumStockLevel", 0] },
          { $lte: ["$quantity", "$minimumStockLevel"] },
          { $gt: ["$quantity", 0] },
        ],
      },
    }),
    Product.countDocuments({ isActive: true, quantity: 0 }),
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
  return {
    totalProducts,
    totalCategories,
    totalSuppliers,
    totalStockUnits: stockAgg[0]?.totalUnits || 0,
    lowStockProducts: lowStock,
    outOfStockProducts: outOfStock,
    totalInventoryValue: valuationAgg[0]?.totalValue || 0,
  };
}
export async function getRecentTransactions(limit = 10) {
  return await StockTransaction.find()
    .populate("product", "productName sku")
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
export async function getStockOverview() {
  const topProducts = await Product.find({ isActive: true })
    .select("productName quantity unit")
    .sort({ quantity: -1 })
    .limit(10)
    .lean();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const movementData = await StockTransaction.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          type: "$transactionType",
        },
        total: { $sum: "$quantity" },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);
  return { topProducts, movementData };
}
