/**
 * Achievements API Tests
 * Tests: fetching user badges, admin badge minting
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase, createTestUser, createAdminUser } = require('./setup');

beforeAll(async () => {
  await setupDatabase();
});

describe('GET /api/achievements/user/:userId', () => {
  it('should return badges and leaderboard for the authenticated user', async () => {
    const { token, user } = await createTestUser({ name: 'Badge Collector' });

    const res = await request(app)
      .get(`/api/achievements/user/${user.id}`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('badges');
    expect(res.body).toHaveProperty('leaderboard');
    expect(Array.isArray(res.body.badges)).toBe(true);
  });

  it('should prevent users from viewing another user\'s achievements', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    const res = await request(app)
      .get(`/api/achievements/user/${user2.user.id}`)
      .set('Authorization', user1.token);

    expect(res.status).toBe(403);
  });
});

describe('POST /api/achievements/mint', () => {
  it('should allow admin to mint a badge', async () => {
    const admin = await createAdminUser();
    const user = await createTestUser();

    const res = await request(app)
      .post('/api/achievements/mint')
      .set('Authorization', admin.token)
      .send({
        user_id: user.user.id,
        badge_title: 'Test Champion',
        badge_type: 'tree_champion'
      });

    expect(res.status).toBe(200);
    expect(res.body.badge_title).toBe('Test Champion');
    expect(res.body.stellar_tx_hash).toBeDefined();
  });

  it('should reject minting without required fields', async () => {
    const admin = await createAdminUser();

    const res = await request(app)
      .post('/api/achievements/mint')
      .set('Authorization', admin.token)
      .send({ user_id: 1 }); // missing badge_title, badge_type

    expect(res.status).toBe(400);
  });

  it('should reject minting from regular users', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/achievements/mint')
      .set('Authorization', token)
      .send({ badge_title: 'Fake', badge_type: 'hack' });

    expect(res.status).toBe(403);
  });
});
