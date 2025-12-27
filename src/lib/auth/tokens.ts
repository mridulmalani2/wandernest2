/**
 * Secure Token Generation for Student Match Accept/Decline Links
 *
 * Uses HMAC-SHA256 signing to create tamper-proof tokens that encode:
 * - requestId (TouristRequest ID)
 * - studentId (Student ID)
 * - selectionId (RequestSelection ID)
 * - action (accept or decline)
 * - expiry (timestamp)
 */

import * as crypto from 'crypto';

const TOKEN_FAILURE_LOG = '[token-verification] Invalid or expired token';

// Secret key for signing tokens - use env var or fallback to secure random string
const TOKEN_SECRET = process.env.TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'tourwiseco-token-secret-change-in-production';

export interface MatchTokenPayload {
  requestId: string;
  studentId: string;
  selectionId: string;
  action: 'accept' | 'decline';
  exp: number; // expiry timestamp (ms since epoch)
}

export interface SelectionTokenPayload {
  requestId: string;
  studentId: string;
  exp: number; // expiry timestamp (ms since epoch)
}

/**
 * Validate parsed token payload has required fields with correct types
 * Returns null if validation fails
 */
function validateMatchTokenPayload(parsed: unknown): MatchTokenPayload | null {
  if (parsed === null || typeof parsed !== 'object') {
    return null;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate required string fields
  if (typeof obj.requestId !== 'string' || !obj.requestId) return null;
  if (typeof obj.studentId !== 'string' || !obj.studentId) return null;
  if (typeof obj.selectionId !== 'string' || !obj.selectionId) return null;

  // Validate action is one of the allowed values
  if (obj.action !== 'accept' && obj.action !== 'decline') return null;

  // Validate expiry is a number
  if (typeof obj.exp !== 'number') return null;

  return {
    requestId: obj.requestId,
    studentId: obj.studentId,
    selectionId: obj.selectionId,
    action: obj.action,
    exp: obj.exp,
  };
}

/**
 * Validate parsed selection token payload has required fields with correct types
 * Returns null if validation fails
 */
function validateSelectionTokenPayload(parsed: unknown): SelectionTokenPayload | null {
  if (parsed === null || typeof parsed !== 'object') {
    return null;
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.requestId !== 'string' || !obj.requestId) return null;
  if (typeof obj.studentId !== 'string' || !obj.studentId) return null;
  if (typeof obj.exp !== 'number') return null;

  return {
    requestId: obj.requestId,
    studentId: obj.studentId,
    exp: obj.exp,
  };
}

/**
 * Generate a signed token for student match actions
 *
 * @param payload - Token data
 * @param expiryHours - How long the token is valid (default 72 hours)
 * @returns Signed token string
 */
export function generateMatchToken(
  payload: Omit<MatchTokenPayload, 'exp'>,
  expiryHours: number = 72
): string {
  const exp = Date.now() + (expiryHours * 60 * 60 * 1000);

  const fullPayload: MatchTokenPayload = {
    ...payload,
    exp,
  };

  // Encode payload as base64
  const payloadJson = JSON.stringify(fullPayload);
  const payloadB64 = Buffer.from(payloadJson).toString('base64url');

  // Sign with HMAC-SHA256
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url');

  // Return format: payload.signature
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode a match token
 *
 * @param token - The token string to verify
 * @returns Decoded payload if valid, null if invalid/expired
 */
function timingSafeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  const maxLength = Math.max(aBuf.length, bBuf.length);
  const aPadded = aBuf.length === maxLength ? aBuf : Buffer.concat([aBuf, Buffer.alloc(maxLength - aBuf.length)]);
  const bPadded = bBuf.length === maxLength ? bBuf : Buffer.concat([bBuf, Buffer.alloc(maxLength - bBuf.length)]);

  const equal = crypto.timingSafeEqual(aPadded, bPadded);
  return equal && aBuf.length === bBuf.length;
}

function logTokenFailure(): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(TOKEN_FAILURE_LOG);
  }
}

function normalizeBaseUrl(baseUrl: string): URL {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error('Invalid base URL configuration');
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Invalid base URL protocol');
  }

  url.search = '';
  url.hash = '';
  return url;
}

export function verifyMatchToken(token: string): MatchTokenPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payloadB64, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (!timingSafeCompare(signature, expectedSignature)) {
      logTokenFailure();
      return null;
    }

    // Decode payload
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(payloadJson);

    // Validate payload structure
    const payload = validateMatchTokenPayload(parsed);
    if (!payload) {
      logTokenFailure();
      return null;
    }

    // Check expiry
    if (Date.now() > payload.exp) {
      logTokenFailure();
      return null;
    }

    return payload;
  } catch (error) {
    logTokenFailure();
    return null;
  }
}

/**
 * Generate a signed token for tourist selection actions
 *
 * @param payload - Token data
 * @param expiryHours - How long the token is valid (default 4 hours)
 * @returns Signed token string
 */
export function generateSelectionToken(
  payload: Omit<SelectionTokenPayload, 'exp'>,
  expiryHours: number = 4
): string {
  const exp = Date.now() + (expiryHours * 60 * 60 * 1000);

  const fullPayload: SelectionTokenPayload = {
    ...payload,
    exp,
  };

  const payloadJson = JSON.stringify(fullPayload);
  const payloadB64 = Buffer.from(payloadJson).toString('base64url');

  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode a selection token
 *
 * @param token - The token string to verify
 * @returns Decoded payload if valid, null if invalid/expired
 */
export function verifySelectionToken(token: string): SelectionTokenPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }

    const [payloadB64, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (!timingSafeCompare(signature, expectedSignature)) {
      logTokenFailure();
      return null;
    }

    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(payloadJson);

    const payload = validateSelectionTokenPayload(parsed);
    if (!payload) {
      logTokenFailure();
      return null;
    }

    if (Date.now() > payload.exp) {
      logTokenFailure();
      return null;
    }

    return payload;
  } catch (error) {
    logTokenFailure();
    return null;
  }
}

/**
 * Generate accept and decline URLs for a student match
 *
 * @param baseUrl - The base URL of the application (e.g., https://tourwiseco.com)
 * @param requestId - TouristRequest ID
 * @param studentId - Student ID
 * @param selectionId - RequestSelection ID
 * @returns Object with acceptUrl and declineUrl (token stored in URL fragment)
 */
export function generateMatchUrls(
  baseUrl: string,
  requestId: string,
  studentId: string,
  selectionId: string
): { acceptUrl: string; declineUrl: string } {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);
  const acceptToken = generateMatchToken({
    requestId,
    studentId,
    selectionId,
    action: 'accept',
  });

  const declineToken = generateMatchToken({
    requestId,
    studentId,
    selectionId,
    action: 'decline',
  });

  const acceptUrl = new URL('/api/student/match/respond', safeBaseUrl);
  acceptUrl.hash = `token=${encodeURIComponent(acceptToken)}`;
  const declineUrl = new URL('/api/student/match/respond', safeBaseUrl);
  declineUrl.hash = `token=${encodeURIComponent(declineToken)}`;

  return {
    acceptUrl: acceptUrl.toString(),
    declineUrl: declineUrl.toString(),
  };
}
