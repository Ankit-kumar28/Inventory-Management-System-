import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants/index.js";
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Valid email required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    phoneNumber: { type: String, trim: true, default: "" },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.STAFF },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
userSchema.methods.toSafeObject = function () {
  const o = this.toObject();
  delete o.password;
  return o;
};
export const User = mongoose.model("User", userSchema);
