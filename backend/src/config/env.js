import dotenv from "dotenv";
dotenv.config();
const required = ["SESSION_SECRET"];
for (const key of required) {
  if (!process.env[key]) console.warn(`Warning: ${key} is not set.`);
}
export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/inventory_management",
  sessionSecret:
    process.env.SESSION_SECRET || "changeme-use-strong-secret-in-production",
  sessionName: process.env.SESSION_NAME || "inventory.sid",
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || "86400000", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  appUrl: process.env.APP_URL || "http://localhost:5000",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  isProduction: process.env.NODE_ENV === "production",
};
