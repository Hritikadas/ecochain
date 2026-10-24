/**
 * Auth API Tests
 * Tests: registration, login, profile, password change, token validation
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase, createTestUser, createAdminUser } = require('./setup');

beforeAll(async () => {
  await setupDatabase();
});

describe('POST /api/auth/register', () => {
  it('should register a new user with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Green',
        email: `alice_${Date.now()}@test.com`,
        password: 'StrongPass1'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBeDefined();
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'missing@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should reject weak passwords (too short)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Weak', email: `weak_${Date.now()}@test.com`, password: 'Abc1' });

    expect(res.status).toBe(400);
  });

  it('should reject passwords without uppercase/lowercase/number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Weak2', email: `weak2_${Date.now()}@test.com`, password: 'alllowercase' });

    expect(res.status).toBe(400);
  });

  it('should reject duplicate email registration', async () => {
    const email = `dup_${Date.now()}@test.com`;

    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Original', email, password: 'StrongPass1' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Duplicate', email, password: 'StrongPass2' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  let testEmail;
  const testPassword = 'SecureLogin1';

  beforeAll(async () => {
    testEmail = `login_${Date.now()}@test.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: testEmail, password: testPassword });
  });

  it('should login with valid credentials and return a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toMatch(/^Bearer /);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPass1' });

    expect(res.status).toBe(401);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'Whatever1' });

    expect(res.status).toBe(401);
  });

  it('should reject login with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/profile', () => {
  it('should return user profile with valid token', async () => {
    const { token } = await createTestUser({ name: 'Profile Test' });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.authenticatedUser).toBeDefined();
    expect(res.body.authenticatedUser.name).toBe('Profile Test');
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid_token_xyz');

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/auth/profile', () => {
  it('should update user name', async () => {
    const { token } = await createTestUser({ name: 'Old Name' });

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', token)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('New Name');
  });

  it('should reject name shorter than 2 characters', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', token)
      .send({ name: 'X' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/auth/change-password', () => {
  it('should change password with correct current password', async () => {
    const password = 'Original1';
    const { token } = await createTestUser({ password });

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', token)
      .send({ currentPassword: password, newPassword: 'Changed1New' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject change with wrong current password', async () => {
    const { token } = await createTestUser({ password: 'Correct1' });

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', token)
      .send({ currentPassword: 'Wrong1xxx', newPassword: 'NewPass1x' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/verify', () => {
  it('should verify a valid token', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.message).toMatch(/valid/i);
  });
});

describe('GET /api/auth/stats', () => {
  it('should return eco activity stats', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .get('/api/auth/stats')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.stats).toBeDefined();
    expect(typeof res.body.stats.treesPlanted).toBe('number');
    expect(typeof res.body.stats.badgesEarned).toBe('number');
  });
});
