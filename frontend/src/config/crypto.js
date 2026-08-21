/**
 * Client-side encryption utilities using Web Crypto API
 * AES-256-GCM encryption for sensitive data
 */

// Convert string to ArrayBuffer
function stringToBuffer(str) {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to hex string
function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to ArrayBuffer
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Generate a new AES-256-GCM encryption key
 */
export async function generateKey() {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
}

/**
 * Encrypt plaintext with AES-256-GCM
 * Returns: iv:ciphertext (both hex-encoded)
 */
export async function encryptData(plaintext, keyHex) {
  const keyBuffer = hexToBuffer(keyHex);
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    stringToBuffer(plaintext)
  );

  return `${bufferToHex(iv)}:${bufferToHex(encrypted)}`;
}

/**
 * Decrypt AES-256-GCM ciphertext
 */
export async function decryptData(ciphertext, keyHex) {
  const keyBuffer = hexToBuffer(keyHex);
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const [ivHex, dataHex] = ciphertext.split(':');
  const iv = hexToBuffer(ivHex);
  const data = hexToBuffer(dataHex);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Hash sensitive data (e.g., for fingerprinting)
 */
export async function hashData(data) {
  const buffer = stringToBuffer(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}
