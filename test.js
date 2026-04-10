// tests/unit/password.test.js
const bcrypt = require('bcrypt');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');        // your Express app
const userModel = require('./Model/userModel');


describe('Password hashing', () => {

    test('hashed password should not equal original', async () => {
    const original = 'mySecret123';
    const hashed = await bcrypt.hash(original, 12);

    expect(hashed).not.toBe(original);   // ✅ must be different
    });

    test('correct password should match hash', async () => {
    const original = 'mySecret123';
    const hashed = await bcrypt.hash(original, 12);
    const result = await bcrypt.compare(original, hashed);

    expect(result).toBe(true);           // ✅ must match
    });

test('wrong password should not match hash', async () => {
    const hashed = await bcrypt.hash('mySecret123', 12);
    const result = await bcrypt.compare('wrongPassword', hashed);

    expect(result).toBe(false);          // ✅ must not match
    });

});

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/ecommerce_test');

  const hashedPassword = await bcrypt.hash('Test1234', 12);
  await userModel.create({
    name: 'Test User',
    email: 'test@test.com',
    passwordHash: hashedPassword,
    phone: '0100000000'
  });
});

// After all tests: delete everything and disconnect
afterAll(async () => {
  await userModel.deleteMany({});
  await mongoose.connection.close();
});

// --- THE ACTUAL TESTS ---

describe('POST /api/v1/user/login', () => {

  test('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/user/login')
      .send({ email: 'test@test.com', passwordHash: 'Test1234' });

    expect(res.statusCode).toBe(200);          // must return 200
    expect(res.body.status).toBe('success');   // must say success
    expect(res.body.token).toBeDefined();      // must have a token
  });

  test('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/user/login')
      .send({ email: 'test@test.com', passwordHash: 'wrongPassword' });

    expect(res.statusCode).toBe(400);          // must return 400
  });

  test('should fail with non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/user/login')
      .send({ email: 'nobody@test.com', passwordHash: 'Test1234' });

    expect(res.statusCode).toBe(404);          // must return 404
  });

});