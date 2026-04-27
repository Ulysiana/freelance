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
  billingCurrency: string | null
  totpEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

function toSafeUser(user: { id: string; email: string; name: string | null; pseudo: string | null; role: Role; billingCurrency: string | null; totpSecret: string | null; totpEnabled: boolean; createdAt: Date; updatedAt: Date; passwordHash: string }): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    pseudo: user.pseudo,
    role: user.role,
    billingCurrency: user.billingCurrency,
    totpEnabled: user.totpEnabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function createUser(email: string, password: string, name?: string, pseudo?: string, role: Role = 'CLIENT', billingCurrency?: string | null): Promise<SafeUser> {
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email: email.toLowerCase().trim(), passwordHash, name, pseudo, role, billingCurrency: billingCurrency ?? null },
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

export async function updateUser(id: string, data: { name?: string; pseudo?: string; email?: string; password?: string; role?: Role; billingCurrency?: string | null }): Promise<SafeUser> {
  const update: Record<string, unknown> = {}
  if (data.name !== undefined) update.name = data.name
  if (data.pseudo !== undefined) update.pseudo = data.pseudo
  if (data.email !== undefined) update.email = data.email.toLowerCase().trim()
  if (data.password !== undefined) update.passwordHash = await hashPassword(data.password)
  if (data.role !== undefined) update.role = data.role
  if (data.billingCurrency !== undefined) update.billingCurrency = data.billingCurrency
  const user = await prisma.user.update({ where: { id }, data: update })
  return toSafeUser(user)
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Supprime les enregistrements qui référencent l'utilisateur sans cascade
    await tx.timeSession.deleteMany({ where: { userId: id } })
    await tx.taskComment.deleteMany({ where: { authorId: id } })
    await tx.attachment.deleteMany({ where: { uploadedByUserId: id } })
    await tx.message.deleteMany({ where: { authorId: id } })
    await tx.htmlPage.deleteMany({ where: { uploadedByUserId: id } })
    await tx.document.deleteMany({ where: { authorId: id } })
    await tx.projectFile.deleteMany({ where: { uploadedById: id } })
    await tx.projectRequest.deleteMany({ where: { authorId: id } })
    await tx.projectCollaborator.deleteMany({ where: { collaboratorId: id } })
    await tx.invitation.deleteMany({ where: { createdBy: id } })
    await tx.session.deleteMany({ where: { userId: id } })

    // Supprime les projets dont l'utilisateur est client
    // (cascade Prisma gère Phase→Task→TimeSessions/Comments/Attachments/Todos
    //  + Documents, Messages, HtmlPages, ProjectFiles, ProjectRequests)
    await tx.project.deleteMany({ where: { clientId: id } })

    // Supprime l'utilisateur (cascade Prisma gère Invoice et ClientFile via clientId)
    await tx.user.delete({ where: { id } })
  })
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
  | { success: true; user: SafeUser; session: { token: string } | null; totpEnabled: boolean }
  | { success: false }
> {
  const user = await findUserByEmail(email)
  if (!user) return { success: false }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { success: false }
  if (user.totpEnabled) {
    return { success: true, user: toSafeUser(user), session: null, totpEnabled: true }
  }
  const session = await createSession(user.id)
  return { success: true, user: toSafeUser(user), session, totpEnabled: false }
}
