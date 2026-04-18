import type { SafeUser } from '@/lib/db/users'

export function projectAccessWhere(user: SafeUser) {
  if (user.role === 'ADMIN') return {}
  if (user.role === 'CLIENT') return { clientId: user.id }
  return { collaborators: { some: { collaboratorId: user.id } } }
}
