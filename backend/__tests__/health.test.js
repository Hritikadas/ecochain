/**
 * Health & Integration Tests
 * Tests: health endpoint, CORS, security headers, 404 handling
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase } = require('./setup');

beforeAll(async () => {
  await setupDatabase();
});

describe('GET /api/health', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.encryption).toBe('AES-256-GCM');
    expect(res.body.timestamp).toBeDefined();
  });

  it('should report database type', async () => {
    const res = await request(app).get('/api/health');

    // In test env (no DATABASE_URL), should be SQLite
    expect(res.body.database).toMatch(/SQLite|PostgreSQL/);
  });
});

describe('Security Headers', () => {
  it('should set Helmet security headers', async () => {
    const res = await request(app).get('/api/health');

    // Helmet sets these headers
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});

describe('404 Handling', () => {
  it('should not crash on unknown API routes', async () => {
    const res = await request(app).get('/api/nonexistent');

    // Express returns 404 by default for unmatched routes
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('CORS', () => {
  it('should allow requests from whitelisted origins', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5174');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('Body Parsing', () => {
  it('should parse JSON bodies', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ name: 'JSON Test', email: `json_${Date.now()}@test.com`, password: 'JsonPass1' }));

    expect(res.status).toBe(201);
  });
});
