import { User } from "../models/User.js";
import { ROLES } from "../constants/index.js";
export async function getUsers({
  page = 1,
  limit = 20,
  search,
  role,
  isActive,
}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (search)
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  if (role) filter.role = role;
  if (typeof isActive !== "undefined")
    filter.isActive = isActive === "true" || isActive === true;
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}
export async function createUser(data) {
  const user = new User(data);
  await user.save();
  return user.toSafeObject();
}
export async function getUserById(id) {
  const user = await User.findById(id).select("-password").lean();
  if (!user) throw { status: 404, message: "User not found" };
  return user;
}
export async function updateUser(
  id,
  data,
  requestingUserId,
  requestingUserRole,
) {
  if (String(id) === String(requestingUserId) && data.role)
    throw { status: 403, message: "You cannot change your own role" };
  if (data.role === ROLES.ADMIN && requestingUserRole !== ROLES.ADMIN)
    throw {
      status: 403,
      message: "Only administrators can assign the admin role",
    };
  if (data.password) {
    const user = await User.findById(id).select("+password");
    if (!user) throw { status: 404, message: "User not found" };
    user.password = data.password;
    const { password, ...rest } = data;
    Object.assign(user, rest);
    await user.save();
    return user.toSafeObject();
  }
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).select("-password");
  if (!user) throw { status: 404, message: "User not found" };
  return user;
}
export async function toggleUserStatus(id, requestingUserId) {
  const user = await User.findById(id).select("-password");
  if (!user) throw { status: 404, message: "User not found" };
  if (String(id) === String(requestingUserId))
    throw { status: 400, message: "You cannot deactivate your own account" };
  if (user.role === ROLES.ADMIN && user.isActive) {
    const activeAdmins = await User.countDocuments({
      role: ROLES.ADMIN,
      isActive: true,
    });
    if (activeAdmins <= 1)
      throw {
        status: 400,
        message: "Cannot deactivate the last active administrator",
      };
  }
  user.isActive = !user.isActive;
  await user.save();
  return user;
}
