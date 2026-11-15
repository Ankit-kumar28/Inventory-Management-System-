import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { StockTransaction } from '../models/StockTransaction.js';
import { TRANSACTION_TYPES } from '../constants/index.js';

export async function stockIn({
  productId,
  supplierId,
  quantity,
  unitPrice = 0,
  referenceNumber = '',
  notes = '',
  userId,
}) {
  let dbSession = null;
  let useTransaction = false;

  try {
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    useTransaction = true;
  } catch (err) {
    // Standalone MongoDB without replica set does not support multi-document transactions
    dbSession = null;
    useTransaction = false;
  }

  try {
    const sessionOption = useTransaction ? { session: dbSession } : {};

    const product = await Product.findOneAndUpdate(
      { _id: productId, isActive: true },
      { $inc: { quantity } },
      { new: true, ...sessionOption }
    );

    if (!product) {
      if (useTransaction) await dbSession.abortTransaction();
      throw { status: 404, message: 'Product not found or inactive' };
    }

    const transactionDocs = await StockTransaction.create(
      [
        {
          product: productId,
          supplier: supplierId || null,
          transactionType: TRANSACTION_TYPES.STOCK_IN,
          quantity,
          unitPrice,
          referenceNumber,
          notes,
          createdBy: userId,
        },
      ],
      sessionOption
    );

    if (useTransaction) {
      await dbSession.commitTransaction();
    }

    return { transaction: transactionDocs[0], product };
  } catch (err) {
    if (useTransaction && dbSession) {
      try {
        await dbSession.abortTransaction();
      } catch (abortErr) {
        // ignore rollback abort errors
      }
    }
    throw err;
  } finally {
    if (dbSession) {
      dbSession.endSession();
    }
  }
}

export async function stockOut({
  productId,
  quantity,
  reason,
  referenceNumber = '',
  notes = '',
  userId,
}) {
  let dbSession = null;
  let useTransaction = false;

  try {
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();
    useTransaction = true;
  } catch (err) {
    dbSession = null;
    useTransaction = false;
  }

  try {
    const sessionOption = useTransaction ? { session: dbSession } : {};

    // Atomic update preventing negative quantity
    const product = await Product.findOneAndUpdate(
      { _id: productId, isActive: true, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true, ...sessionOption }
    );

    if (!product) {
      if (useTransaction) await dbSession.abortTransaction();
      const existing = await Product.findById(productId);
      if (!existing || !existing.isActive) {
        throw { status: 404, message: 'Product not found or inactive' };
      }
      throw {
        status: 400,
        message: `Insufficient stock. Available: ${existing.quantity}, Requested: ${quantity}`,
      };
    }

    const transactionDocs = await StockTransaction.create(
      [
        {
          product: productId,
          transactionType: TRANSACTION_TYPES.STOCK_OUT,
          quantity,
          reason,
          referenceNumber,
          notes,
          createdBy: userId,
        },
      ],
      sessionOption
    );

    if (useTransaction) {
      await dbSession.commitTransaction();
    }

    return { transaction: transactionDocs[0], product };
  } catch (err) {
    if (useTransaction && dbSession) {
      try {
        await dbSession.abortTransaction();
      } catch (abortErr) {
        // ignore rollback abort errors
      }
    }
    throw err;
  } finally {
    if (dbSession) {
      dbSession.endSession();
    }
  }
}

export async function getTransactions({
  page = 1,
  limit = 20,
  type,
  productId,
  startDate,
  endDate,
  search,
}) {
  const filter = {};
  if (type) filter.transactionType = type;
  if (productId) filter.product = productId;
  if (search) filter.referenceNumber = { $regex: search, $options: 'i' };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = e;
    }
  }
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    StockTransaction.find(filter)
      .populate('product', 'productName sku unit')
      .populate('supplier', 'supplierName')
      .populate('createdBy', 'fullName email')
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

export async function getTransactionById(id) {
  const transaction = await StockTransaction.findById(id)
    .populate('product', 'productName sku unit')
    .populate('supplier', 'supplierName')
    .populate('createdBy', 'fullName email')
    .lean();
  if (!transaction) throw { status: 404, message: 'Transaction not found' };
  return transaction;
}
