import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'

// Force this route to be dynamic to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/auth/provider-status
 *
 * Returns the status of authentication providers without exposing secrets.
 * Used by client-side to determine which sign-in methods are available.
 *
 * This route is explicitly dynamic to ensure it always returns current
 * configuration status based on runtime environment variables.
 */
export async function GET(request: NextRequest) {
  await rateLimitByIp(request, 60, 60, 'auth-provider-status')
  // Always evaluate config freshly to catch runtime environment variables
  const providerStatus = {
    providers: {
      google: config.auth.google.isConfigured,
      email: config.email.isConfigured,
    },
  }

  // In development, log the status for debugging


  return NextResponse.json(providerStatus)
}
