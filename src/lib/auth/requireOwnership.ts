import { AuthIdentity } from './requireAuth'
import { AppError } from '@/lib/error-handler'

export function requireOwnership(resourceOwnerId: string, identity: AuthIdentity, allowAdmin = true) {
  if (identity.userId === resourceOwnerId) {
    return
  }

  if (allowAdmin && identity.actorType === 'admin') {
    return
  }

  throw new AppError(403, 'Access denied', 'FORBIDDEN')
}
