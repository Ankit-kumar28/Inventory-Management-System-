import mongoose from "mongoose";
const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    entityType: { type: String, default: "" },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    description: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });
export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
