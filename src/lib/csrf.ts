import type { NextRequest } from 'next/server';
import { AppError } from '@/lib/error-handler';
import { config } from '@/lib/config';

const ORIGIN_ERROR = 'Forbidden: Invalid Origin';
const REFERER_ERROR = 'Forbidden: Invalid Referer';
const MISSING_ERROR = 'Forbidden: Missing Origin';

function collectAllowedOrigins(req: NextRequest): Set<string> {
  const allowed = new Set<string>();
  const configured = [config.app.baseUrl, config.auth.nextAuth.url].filter(Boolean) as string[];

  for (const base of configured) {
    try {
      allowed.add(new URL(base).origin);
    } catch {
      // Ignore invalid URLs - config validation already warns about this
    }
  }

  if (allowed.size === 0) {
    if (process.env.NODE_ENV === 'development') {
      allowed.add(req.nextUrl.origin);
    } else {
      throw new AppError(500, 'Server misconfiguration: Allowed origins not configured', 'CSRF_CONFIG');
    }
  }

  return allowed;
}

function isAllowedOrigin(value: string, allowed: Set<string>): boolean {
  try {
    return allowed.has(new URL(value).origin);
  } catch {
    return false;
  }
}

/**
 * Enforce same-origin policy for state-changing requests.
 * Uses configured base URLs instead of attacker-controlled headers.
 */
export function enforceSameOrigin(req: NextRequest): void {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const allowed = collectAllowedOrigins(req);

  if (origin) {
    if (!isAllowedOrigin(origin, allowed)) {
      throw new AppError(403, ORIGIN_ERROR, 'CSRF_ERROR');
    }
    return;
  }

  if (referer) {
    if (!isAllowedOrigin(referer, allowed)) {
      throw new AppError(403, REFERER_ERROR, 'CSRF_ERROR');
    }
    return;
  }

  throw new AppError(403, MISSING_ERROR, 'CSRF_ERROR');
}
