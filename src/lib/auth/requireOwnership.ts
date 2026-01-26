import { NextResponse } from 'next/server'
import { AuthIdentity } from './requireAuth'

export function requireOwnership(resourceOwnerId: string, identity: AuthIdentity, allowAdmin = true) {
  if (identity.userId === resourceOwnerId) {
    return
  }

  if (allowAdmin && identity.actorType === 'admin') {
    return
  }

  throw NextResponse.json({ error: 'Access denied' }, { status: 403 })
}
