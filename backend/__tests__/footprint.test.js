/**
 * Footprint API Tests
 * Tests: recording emissions, getting footprint history
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase, createTestUser } = require('./setup');

beforeAll(async () => {
  await setupDatabase();
});

describe('POST /api/footprint', () => {
  it('should record a carbon footprint entry', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/footprint')
      .set('Authorization', token)
      .send({ transport: 100, energy: 200, waste: 50 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.total_co2e).toBeDefined();
    // Expected: (100*0.2) + (200*0.4) + (50*0.1) = 20 + 80 + 5 = 105
    expect(res.body.total_co2e).toBe(105);
  });

  it('should reject request with missing parameters', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/footprint')
      .set('Authorization', token)
      .send({ transport: 50 }); // missing energy, waste

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/footprint')
      .send({ transport: 10, energy: 20, waste: 5 });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/footprint', () => {
  it('should return the authenticated user\'s footprint history', async () => {
    const { token } = await createTestUser();

    // Create a log first
    await request(app)
      .post('/api/footprint')
      .set('Authorization', token)
      .send({ transport: 30, energy: 40, waste: 10 });

    const res = await request(app)
      .get('/api/footprint')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('emissions_kg');
  });

  it('should isolate user data — users cannot see each other\'s logs', async () => {
    const user1 = await createTestUser({ name: 'User One' });
    const user2 = await createTestUser({ name: 'User Two' });

    // User 1 creates a log
    await request(app)
      .post('/api/footprint')
      .set('Authorization', user1.token)
      .send({ transport: 999, energy: 999, waste: 999 });

    // User 2's history should NOT contain User 1's log
    const res = await request(app)
      .get('/api/footprint')
      .set('Authorization', user2.token);

    const user2Total = res.body.reduce((sum, log) => sum + log.emissions_kg, 0);
    // User2 shouldn't have the 999 entry
    const hasUser1Entry = res.body.some(
      log => log.input_value === 2997 // 999+999+999
    );
    expect(hasUser1Entry).toBe(false);
  });
});
