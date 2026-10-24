/**
 * Client-side End-to-End Encryption using Web Crypto API
 * AES-256-GCM — compatible with the backend's Node.js crypto format
 *
 * Wire format: iv_hex : tag_hex : ciphertext_hex
 * (matches backend/middleware/encryption.js exactly)
 */

// ─── Encoding helpers ───────────────────────────────────────────────────
function stringToBuffer(str) {
  return new TextEncoder().encode(str);
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// ─── Key import ─────────────────────────────────────────────────────────
async function importKey(keyHex) {
  const keyBuffer = hexToBuffer(keyHex);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── Encrypt ────────────────────────────────────────────────────────────
/**
 * Encrypt plaintext → "iv:tag:ciphertext" (hex-encoded, matching backend format)
 *
 * Web Crypto AES-GCM appends the 16-byte auth tag to the ciphertext.
 * We split it out so the format matches Node.js crypto's separate getAuthTag().
 */
export async function encryptData(plaintext, keyHex) {
  const key = await importKey(keyHex);

  // 16-byte IV to match the backend's IV_LENGTH = 16
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encryptedWithTag = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    stringToBuffer(plaintext)
  );

  // Web Crypto output = ciphertext || tag (last 16 bytes)
  const combined = new Uint8Array(encryptedWithTag);
  const ciphertext = combined.slice(0, combined.length - 16);
  const tag = combined.slice(combined.length - 16);

  return `${bufferToHex(iv)}:${bufferToHex(tag)}:${bufferToHex(ciphertext)}`;
}

// ─── Decrypt ────────────────────────────────────────────────────────────
/**
 * Decrypt "iv:tag:ciphertext" → plaintext
 */
export async function decryptData(payload, keyHex) {
  const key = await importKey(keyHex);
  const parts = payload.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format — expected iv:tag:ciphertext');
  }

  const iv = hexToBuffer(parts[0]);
  const tag = hexToBuffer(parts[1]);
  const ciphertext = hexToBuffer(parts[2]);

  // Web Crypto expects ciphertext || tag
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext, 0);
  combined.set(tag, ciphertext.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    combined
  );

  return new TextDecoder().decode(decrypted);
}

// ─── Hash ───────────────────────────────────────────────────────────────
export async function hashData(data) {
  const buffer = stringToBuffer(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}
