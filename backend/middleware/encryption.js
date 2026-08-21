const crypto = require('crypto');

// AES-256-GCM encryption for sensitive API payloads
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt a plaintext string using AES-256-GCM
 */
function encrypt(plaintext) {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  // Return iv:tag:ciphertext
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string
 */
function decrypt(ciphertext) {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const parts = ciphertext.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Middleware: Encrypt sensitive response data
 * Wraps res.json to optionally encrypt the response body
 */
function encryptResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    // Only encrypt if client requests it via header
    if (req.headers['x-request-encrypted'] === 'true') {
      const encrypted = encrypt(JSON.stringify(data));
      return originalJson({ encrypted: true, payload: encrypted });
    }
    return originalJson(data);
  };

  next();
}

/**
 * Middleware: Decrypt incoming encrypted request body
 */
function decryptRequest(req, res, next) {
  if (req.body && req.body.encrypted === true && req.body.payload) {
    try {
      const decrypted = JSON.parse(decrypt(req.body.payload));
      req.body = decrypted;
    } catch (err) {
      return res.status(400).json({ error: 'Failed to decrypt request payload.' });
    }
  }
  next();
}

/**
 * Key exchange endpoint handler — provides the public encryption key to clients
 */
function getEncryptionKey(req, res) {
  // In production, use asymmetric key exchange (RSA/ECDH)
  // For this implementation, we use a shared symmetric key
  res.json({
    algorithm: ALGORITHM,
    keyHint: ENCRYPTION_KEY.substring(0, 8) + '...',
    message: 'Use the encryption key from your secure environment configuration.'
  });
}

module.exports = {
  encrypt,
  decrypt,
  encryptResponse,
  decryptRequest,
  getEncryptionKey,
  ENCRYPTION_KEY
};
