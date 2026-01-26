import { AuthIdentity } from './requireAuth'
import { AppError } from '@/lib/error-handler'

export function requireRole(identity: AuthIdentity, roles: string[]) {
  if (identity.actorType !== 'admin') {
    throw new AppError(403, 'Forbidden', 'FORBIDDEN')
  }

  if (!identity.role || !roles.includes(identity.role)) {
    throw new AppError(403, 'Forbidden', 'FORBIDDEN')
  }
}
