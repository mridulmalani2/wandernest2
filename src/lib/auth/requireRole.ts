import { NextResponse } from 'next/server'
import { AuthIdentity } from './requireAuth'

export function requireRole(identity: AuthIdentity, roles: string[]) {
  if (identity.actorType !== 'admin') {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!identity.role || !roles.includes(identity.role)) {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}
