import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { StockTransaction } from '../models/StockTransaction.js';
import { TRANSACTION_TYPES } from '../constants/index.js';

function isReplicaSet() {
  const type = mongoose.connection.client?.topology?.description?.type;
  return type === 'ReplicaSetWithPrimary' || type === 'Sharded';
}

export async function stockIn({
  productId,
  supplierId,
  quantity,
  unitPrice = 0,
  referenceNumber = '',
  notes = '',
  userId,
}) {
  const validSupplierId =
    supplierId && mongoose.Types.ObjectId.isValid(supplierId) ? supplierId : null;

  // Use replica-set multi-document transaction if cluster topology supports it
  if (isReplicaSet()) {
    const dbSession = await mongoose.startSession();
    try {
      dbSession.startTransaction();

      const product = await Product.findOneAndUpdate(
        { _id: productId, isActive: true },
        { $inc: { quantity } },
        { new: true, session: dbSession }
      );

      if (!product) {
        await dbSession.abortTransaction();
        throw { status: 404, message: 'Product not found or inactive' };
      }

      const transactionDocs = await StockTransaction.create(
        [
          {
            product: productId,
            supplier: validSupplierId,
            transactionType: TRANSACTION_TYPES.STOCK_IN,
            quantity,
            unitPrice,
            referenceNumber,
            notes,
            createdBy: userId,
          },
        ],
        { session: dbSession }
      );

      await dbSession.commitTransaction();
      return { transaction: transactionDocs[0], product };
    } catch (err) {
      await dbSession.abortTransaction();
      throw err;
    } finally {
      dbSession.endSession();
    }
  }

  // Standalone MongoDB: atomic update with compensation rollback
  const product = await Product.findOneAndUpdate(
    { _id: productId, isActive: true },
    { $inc: { quantity } },
    { new: true }
  );

  if (!product) {
    throw { status: 404, message: 'Product not found or inactive' };
  }

  try {
    const transaction = await StockTransaction.create({
      product: productId,
      supplier: validSupplierId,
      transactionType: TRANSACTION_TYPES.STOCK_IN,
      quantity,
      unitPrice,
      referenceNumber,
      notes,
      createdBy: userId,
    });

    return { transaction, product };
  } catch (err) {
    // Compensating rollback: reverse the increment if transaction creation fails
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });
    throw err;
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
  // Use replica-set multi-document transaction if cluster topology supports it
  if (isReplicaSet()) {
    const dbSession = await mongoose.startSession();
    try {
      dbSession.startTransaction();

      const product = await Product.findOneAndUpdate(
        { _id: productId, isActive: true, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true, session: dbSession }
      );

      if (!product) {
        await dbSession.abortTransaction();
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
        { session: dbSession }
      );

      await dbSession.commitTransaction();
      return { transaction: transactionDocs[0], product };
    } catch (err) {
      await dbSession.abortTransaction();
      throw err;
    } finally {
      dbSession.endSession();
    }
  }

  // Standalone MongoDB: atomic conditional update preventing negative quantities
  const product = await Product.findOneAndUpdate(
    { _id: productId, isActive: true, quantity: { $gte: quantity } },
    { $inc: { quantity: -quantity } },
    { new: true }
  );

  if (!product) {
    const existing = await Product.findById(productId);
    if (!existing || !existing.isActive) {
      throw { status: 404, message: 'Product not found or inactive' };
    }
    throw {
      status: 400,
      message: `Insufficient stock. Available: ${existing.quantity}, Requested: ${quantity}`,
    };
  }

  try {
    const transaction = await StockTransaction.create({
      product: productId,
      transactionType: TRANSACTION_TYPES.STOCK_OUT,
      quantity,
      reason,
      referenceNumber,
      notes,
      createdBy: userId,
    });

    return { transaction, product };
  } catch (err) {
    // Compensating rollback: restore the quantity if transaction log fails
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantity } });
    throw err;
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
