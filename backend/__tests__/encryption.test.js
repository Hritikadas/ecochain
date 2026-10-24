/**
 * Encryption Middleware Tests
 * Tests: encrypt/decrypt roundtrip, middleware behavior, key exchange
 */
const request = require('supertest');
const app = require('../app');
const { setupDatabase } = require('./setup');
const { encrypt, decrypt, ENCRYPTION_KEY } = require('../middleware/encryption');

beforeAll(async () => {
  await setupDatabase();
});

describe('Encryption Core Functions', () => {
  it('should encrypt and decrypt a string roundtrip', () => {
    const plaintext = 'Hello, EcoChain! 🌱';
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for the same plaintext (random IV)', () => {
    const plaintext = 'Deterministic test';
    const encrypted1 = encrypt(plaintext);
    const encrypted2 = encrypt(plaintext);

    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should use iv:tag:ciphertext format', () => {
    const encrypted = encrypt('format test');
    const parts = encrypted.split(':');

    expect(parts.length).toBe(3);
    // IV = 16 bytes = 32 hex chars
    expect(parts[0].length).toBe(32);
    // Tag = 16 bytes = 32 hex chars
    expect(parts[1].length).toBe(32);
    // Ciphertext length varies
    expect(parts[2].length).toBeGreaterThan(0);
  });

  it('should throw on tampered ciphertext', () => {
    const encrypted = encrypt('tamper test');
    const tampered = encrypted.slice(0, -2) + 'ff'; // alter last byte

    expect(() => decrypt(tampered)).toThrow();
  });

  it('should throw on invalid format', () => {
    expect(() => decrypt('not:enough')).toThrow('Invalid encrypted format');
    expect(() => decrypt('one')).toThrow('Invalid encrypted format');
  });

  it('should handle empty string', () => {
    const encrypted = encrypt('');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle large payloads', () => {
    const largeText = 'x'.repeat(100000);
    const encrypted = encrypt(largeText);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(largeText);
  });

  it('should handle unicode and emoji', () => {
    const text = '🌳🌍💚 Carbon ≤ 0 · Σ(CO₂) → 0';
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });
});

describe('Encryption Middleware Integration', () => {
  it('should return plaintext by default (no x-request-encrypted header)', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.encrypted).toBeUndefined();
  });

  it('should return encrypted response when x-request-encrypted header is set', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('x-request-encrypted', 'true');

    expect(res.status).toBe(200);
    expect(res.body.encrypted).toBe(true);
    expect(res.body.payload).toBeDefined();

    // Decrypt the payload
    const decrypted = JSON.parse(decrypt(res.body.payload));
    expect(decrypted.status).toBe('healthy');
  });

  it('should decrypt an encrypted request body', async () => {
    // Send an encrypted registration request
    const payload = encrypt(JSON.stringify({
      name: 'Encrypted User',
      email: `encrypted_${Date.now()}@test.com`,
      password: 'EncryptedPass1'
    }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ encrypted: true, payload });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject malformed encrypted payloads', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ encrypted: true, payload: 'not:valid:hex:data' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/decrypt/i);
  });
});

describe('GET /api/encryption/key', () => {
  it('should return encryption algorithm info', async () => {
    const res = await request(app).get('/api/encryption/key');

    expect(res.status).toBe(200);
    expect(res.body.algorithm).toBe('aes-256-gcm');
    expect(res.body.keyHint).toBeDefined();
    // Should only show first 8 chars of the key
    expect(res.body.keyHint.endsWith('...')).toBe(true);
  });
});
