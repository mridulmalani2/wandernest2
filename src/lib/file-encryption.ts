import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { AppError } from '@/lib/error-handler';
import { config } from '@/lib/config';

const ENCRYPTION_PREFIX = 'enc:v1:';
const ENCRYPTION_ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
  const rawKey =
    process.env.FILE_STORAGE_ENCRYPTION_KEY ||
    config.auth.nextAuth.secret ||
    config.auth.jwt.secret;

  if (!rawKey) {
    if (config.app.isProduction) {
      throw new AppError(500, 'Server misconfiguration: File encryption key missing', 'FILE_ENCRYPTION_KEY_MISSING');
    }
    // Development fallback - stable but non-production
    return createHash('sha256').update('dev-file-encryption-key').digest();
  }

  // Accept base64, hex, or raw string
  if (/^[0-9a-f]{64}$/i.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  try {
    const decoded = Buffer.from(rawKey, 'base64');
    if (decoded.length === 32) {
      return decoded;
    }
  } catch {
    // fall through to hashing
  }

  return createHash('sha256').update(rawKey).digest();
}

export function encryptFileContent(buffer: Buffer): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join('');
}

export function decryptFileContent(content: string): Buffer {
  if (!content.startsWith(ENCRYPTION_PREFIX)) {
    return Buffer.from(content, 'base64');
  }

  const payload = content.slice(ENCRYPTION_PREFIX.length);
  const [ivBase64, tagBase64, cipherBase64] = payload.split(':');

  if (!ivBase64 || !tagBase64 || !cipherBase64) {
    throw new AppError(400, 'Corrupted encrypted file payload', 'FILE_ENCRYPTION_INVALID');
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');
  const cipherText = Buffer.from(cipherBase64, 'base64');

  const decipher = createDecipheriv(ENCRYPTION_ALGO, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(cipherText), decipher.final()]);
}
