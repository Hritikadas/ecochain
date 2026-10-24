/**
 * Certificates API Tests
 * Tests: getting user certificates, admin minting
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase, createTestUser, createAdminUser } = require('./setup');

beforeAll(async () => {
  await setupDatabase();
});

describe('GET /api/certificates', () => {
  it('should return certificates for the authenticated user', async () => {
    const { token } = await createTestUser({ name: 'Hritika Das' });

    const res = await request(app)
      .get('/api/certificates')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/certificates');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/certificates/mint', () => {
  it('should allow admin to mint a certificate', async () => {
    const { token } = await createAdminUser();

    const res = await request(app)
      .post('/api/certificates/mint')
      .set('Authorization', token)
      .send({
        issued_to: 'Test Recipient',
        carbon_tons: 5.5,
        certificate_id: `CERT-TEST-${Date.now()}`
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.certificate_id).toBeDefined();
    expect(res.body.transactionHash).toBeDefined();
  });

  it('should reject minting without required fields', async () => {
    const { token } = await createAdminUser();

    const res = await request(app)
      .post('/api/certificates/mint')
      .set('Authorization', token)
      .send({ certificate_id: 'CERT-MISSING' }); // missing issued_to, carbon_tons

    expect(res.status).toBe(400);
  });

  it('should reject minting from regular users', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/certificates/mint')
      .set('Authorization', token)
      .send({ issued_to: 'Attacker', carbon_tons: 1000 });

    expect(res.status).toBe(403);
  });
});
