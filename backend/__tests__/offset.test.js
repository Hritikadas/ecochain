/**
 * Carbon Offset API Tests
 * Tests: buying offsets, user offsets, leaderboard, transaction verification
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase, createTestUser, createAdminUser } = require('./setup');

beforeAll(async () => {
  await setupDatabase();
});

describe('POST /api/offset/buy', () => {
  it('should purchase carbon credits for the authenticated user', async () => {
    const { token, user } = await createTestUser();

    const res = await request(app)
      .post('/api/offset/buy')
      .set('Authorization', token)
      .send({ amount_usd: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.amount_usd).toBe(10);
    expect(res.body.trees_planted).toBe(5); // $10 * 0.5 = 5 trees
    expect(res.body.transaction_hash).toBeDefined();
  });

  it('should reject amounts below $1', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/offset/buy')
      .set('Authorization', token)
      .send({ amount_usd: 0.5 });

    expect(res.status).toBe(400);
  });

  it('should prevent users from buying for other users', async () => {
    const user1 = await createTestUser({ name: 'Buyer' });
    const user2 = await createTestUser({ name: 'Target' });

    const res = await request(app)
      .post('/api/offset/buy')
      .set('Authorization', user1.token)
      .send({ user_id: user2.user.id, amount_usd: 5 });

    expect(res.status).toBe(403);
  });

  it('should allow admin to buy for any user', async () => {
    const admin = await createAdminUser();
    const user = await createTestUser();

    const res = await request(app)
      .post('/api/offset/buy')
      .set('Authorization', admin.token)
      .send({ user_id: user.user.id, amount_usd: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject unauthenticated purchases', async () => {
    const res = await request(app)
      .post('/api/offset/buy')
      .send({ amount_usd: 10 });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/offset/user/:user_id', () => {
  it('should return the user\'s offset history', async () => {
    const { token, user } = await createTestUser();

    // Create an offset first
    await request(app)
      .post('/api/offset/buy')
      .set('Authorization', token)
      .send({ amount_usd: 15 });

    const res = await request(app)
      .get(`/api/offset/user/${user.id}`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should prevent users from viewing another user\'s offsets', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    const res = await request(app)
      .get(`/api/offset/user/${user2.user.id}`)
      .set('Authorization', user1.token);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/offset/total', () => {
  it('should return leaderboard data', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .get('/api/offset/total')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
