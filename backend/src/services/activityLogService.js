import { ActivityLog } from "../models/ActivityLog.js";
export async function createLog({
  userId,
  action,
  entityType = "",
  entityId = null,
  description = "",
  metadata = {},
}) {
  try {
    await ActivityLog.create({
      user: userId || null,
      action,
      entityType,
      entityId: entityId || null,
      description,
      metadata,
    });
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
}
export async function getLogs({
  page = 1,
  limit = 20,
  userId,
  action,
  entityType,
  startDate,
  endDate,
}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (userId) filter.user = userId;
  if (action) filter.action = action;
  if (entityType) filter.entityType = entityType;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);
  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
