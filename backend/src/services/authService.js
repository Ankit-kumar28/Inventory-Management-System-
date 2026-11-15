import { User } from "../models/User.js";
export async function loginUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );
  if (!user) throw { status: 401, message: "Invalid email or password" };
  if (!user.isActive)
    throw {
      status: 403,
      message: "Your account has been deactivated. Contact an administrator.",
    };
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw { status: 401, message: "Invalid email or password" };
  return user;
}
