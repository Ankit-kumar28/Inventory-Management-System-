import mongoose from 'mongoose';
import { config } from './env.js';
export async function connectDatabase() {
  try {
    const conn = await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}
export function disconnectDatabase() { return mongoose.disconnect(); }
