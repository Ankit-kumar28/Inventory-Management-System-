import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';

const TEST_DB = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory_test';

beforeAll(async () => {
  try {
    await mongoose.connect(TEST_DB, { serverSelectionTimeoutMS: 2000 });
  } catch (err) {
    console.warn('MongoDB not available during test, skipping DB tests');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.dropDatabase();
    } catch {}
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    await User.deleteMany({});
  }
});

describe('GET /api/health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Inventory Management API');
  });
});

describe('POST /api/auth/login', () => {
  it('should return 400 when body is empty', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when email format is invalid', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'notanemail',
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('should return 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
