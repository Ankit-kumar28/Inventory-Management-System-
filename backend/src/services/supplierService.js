import { Supplier } from "../models/Supplier.js";
export async function getSuppliers({
  page = 1,
  limit = 20,
  search,
  includeInactive = false,
}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (!includeInactive) filter.isActive = true;
  if (search)
    filter.$or = [
      { supplierName: { $regex: search, $options: "i" } },
      { contactPerson: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  const [suppliers, total] = await Promise.all([
    Supplier.find(filter)
      .sort({ supplierName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Supplier.countDocuments(filter),
  ]);
  return {
    suppliers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
export async function createSupplier(data) {
  return await Supplier.create(data);
}
export async function updateSupplier(id, data) {
  const supplier = await Supplier.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!supplier) throw { status: 404, message: "Supplier not found" };
  return supplier;
}
export async function deleteSupplier(id) {
  const supplier = await Supplier.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!supplier) throw { status: 404, message: "Supplier not found" };
  return supplier;
}
export async function getSupplierById(id) {
  const supplier = await Supplier.findById(id).lean();
  if (!supplier) throw { status: 404, message: "Supplier not found" };
  return supplier;
}
