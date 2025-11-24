import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

/**
 * GET /api/auth/provider-status
 *
 * Returns the status of authentication providers without exposing secrets.
 * Used by client-side to determine which sign-in methods are available.
 */
export async function GET() {
  return NextResponse.json({
    providers: {
      google: config.auth.google.isConfigured,
      email: config.email.isConfigured,
    },
  })
}
