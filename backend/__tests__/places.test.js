/**
 * Places (Eco Map) API Tests
 * Tests: public place listing, admin-only place creation
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase, createTestUser, createAdminUser } = require('./setup');

beforeAll(async () => {
  await setupDatabase();
});

describe('GET /api/places', () => {
  it('should list all eco-locations (public access)', async () => {
    const res = await request(app).get('/api/places');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should return places with geo coordinates', async () => {
    const res = await request(app).get('/api/places');

    const place = res.body[0];
    expect(place).toHaveProperty('latitude');
    expect(place).toHaveProperty('longitude');
    expect(place).toHaveProperty('name');
    expect(typeof place.latitude).toBe('number');
    expect(typeof place.longitude).toBe('number');
  });
});

describe('POST /api/places', () => {
  it('should allow admin to add a new location', async () => {
    const { token } = await createAdminUser();

    const res = await request(app)
      .post('/api/places')
      .set('Authorization', token)
      .send({
        name: 'Test EV Station',
        latitude: 28.6139,
        longitude: 77.2090,
        description: 'Test charging station',
        type: 'ev_charger'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.placeId).toBeDefined();
  });

  it('should reject place creation from regular users', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/places')
      .set('Authorization', token)
      .send({ name: 'Unauthorized', latitude: 0, longitude: 0 });

    expect(res.status).toBe(403);
  });

  it('should reject place creation with missing coordinates', async () => {
    const { token } = await createAdminUser();

    const res = await request(app)
      .post('/api/places')
      .set('Authorization', token)
      .send({ name: 'No Coords' });

    expect(res.status).toBe(400);
  });
});
