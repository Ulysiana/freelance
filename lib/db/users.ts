import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from './prisma'
import type { Role } from '@prisma/client'

const SALT_ROUNDS = 10
const SESSION_DURATION_DAYS = 7

export type SafeUser = {
  id: string
  email: string
  name: string | null
  pseudo: string | null
  role: Role
  createdAt: Date
  updatedAt: Date
}

function toSafeUser(user: { id: string; email: string; name: string | null; pseudo: string | null; role: Role; createdAt: Date; updatedAt: Date; passwordHash: string }): SafeUser {
  const { passwordHash: _, ...safe } = user
  return safe
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function createUser(email: string, password: string, name?: string, pseudo?: string, role: Role = 'CLIENT'): Promise<SafeUser> {
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email: email.toLowerCase().trim(), passwordHash, name, pseudo, role },
  })
  return toSafeUser(user)
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
}

export async function getAllUsers(): Promise<SafeUser[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return users.map(toSafeUser)
}

export async function updateUser(id: string, data: { name?: string; pseudo?: string; email?: string; password?: string; role?: Role }): Promise<SafeUser> {
  const update: Record<string, unknown> = {}
  if (data.name !== undefined) update.name = data.name
  if (data.pseudo !== undefined) update.pseudo = data.pseudo
  if (data.email !== undefined) update.email = data.email.toLowerCase().trim()
  if (data.password !== undefined) update.passwordHash = await hashPassword(data.password)
  if (data.role !== undefined) update.role = data.role
  const user = await prisma.user.update({ where: { id }, data: update })
  return toSafeUser(user)
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } })
}

// ==================== SESSIONS ====================

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)
  return prisma.session.create({ data: { userId, token, expiresAt } })
}

export async function validateSession(token: string): Promise<SafeUser | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await deleteSession(token)
    return null
  }
  return toSafeUser(session.user)
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => {})
}

// ==================== AUTH ====================

export async function authenticateUser(email: string, password: string): Promise<
  | { success: true; user: SafeUser; session: { token: string } }
  | { success: false }
> {
  const user = await findUserByEmail(email)
  if (!user) return { success: false }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { success: false }
  const session = await createSession(user.id)
  return { success: true, user: toSafeUser(user), session }
}
