import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/db/prisma'
import { getRequiredEnv } from '@/lib/security'

const RESET_TOKEN_MAX_AGE_MS = 60 * 60 * 1000

function createSignature(userId: string, passwordHash: string, expiresAt: number) {
  return createHmac('sha256', `${getRequiredEnv('SECRET_KEY')}:${passwordHash}`)
    .update(`${userId}:${expiresAt}`)
    .digest('hex')
}

export function createPasswordResetToken(userId: string, passwordHash: string) {
  const expiresAt = Date.now() + RESET_TOKEN_MAX_AGE_MS
  const signature = createSignature(userId, passwordHash, expiresAt)
  return Buffer.from(`${userId}:${expiresAt}:${signature}`).toString('base64url')
}

export async function verifyPasswordResetToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const [userId, expiresAtRaw, signature] = decoded.split(':')
    const expiresAt = Number(expiresAtRaw)

    if (!userId || !signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
      return { valid: false as const }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    })

    if (!user) return { valid: false as const }

    const expectedSignature = createSignature(user.id, user.passwordHash, expiresAt)
    const provided = Buffer.from(signature)
    const expected = Buffer.from(expectedSignature)

    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
      return { valid: false as const }
    }

    return {
      valid: true as const,
      user,
      expiresAt: new Date(expiresAt),
    }
  } catch {
    return { valid: false as const }
  }
}

export const PASSWORD_RESET_TOKEN_MAX_AGE_MS = RESET_TOKEN_MAX_AGE_MS
