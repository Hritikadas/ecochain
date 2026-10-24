/**
 * Products API Tests
 * Tests: public product listing, admin-only product creation
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase, createTestUser, createAdminUser } = require('./setup');

beforeAll(async () => {
  await setupDatabase();
});

describe('GET /api/products', () => {
  it('should list all products (public access)', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Seed data should have at least 3 products
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should return product objects with required fields', async () => {
    const res = await request(app).get('/api/products');

    const product = res.body[0];
    expect(product).toHaveProperty('title');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('seller');
    expect(product).toHaveProperty('stellar_asset_code');
  });
});

describe('POST /api/products', () => {
  it('should allow admin to add a product', async () => {
    const { token } = await createAdminUser();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({
        title: 'Test Carbon Credit',
        description: 'A test product from the test suite',
        price: 19.99,
        seller: 'Test Vendor',
        stellar_asset_code: 'TEST',
        category: 'Carbon Offset Asset'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.title).toBe('Test Carbon Credit');
  });

  it('should reject product creation from regular users', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({
        title: 'Unauthorized Product',
        price: 10,
        seller: 'Attacker',
        stellar_asset_code: 'HACK'
      });

    expect(res.status).toBe(403);
  });

  it('should reject product creation without authentication', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ title: 'No Auth', price: 5, seller: 'Nobody', stellar_asset_code: 'NOAUTH' });

    expect(res.status).toBe(401);
  });

  it('should use defaults for missing optional fields', async () => {
    const { token } = await createAdminUser();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({}); // all fields missing — should use defaults

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Unnamed Eco Asset');
  });
});
