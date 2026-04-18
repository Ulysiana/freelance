import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { verifySync } from 'otplib'
import { prisma } from '@/lib/db/prisma'
import { createSession } from '@/lib/db/users'
import { getRequiredEnv, rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

const SESSION_COOKIE = 'session_token'
const OTP_COOKIE = 'otp_challenge'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60

function verifyChallenge(token: string): string | null {
  try {
    const secretKey = getRequiredEnv('SECRET_KEY')
    const decoded = Buffer.from(token, 'base64url').toString()
    const parts = decoded.split(':')
    if (parts.length !== 3) return null
    const [userId, expires, sig] = parts
    if (Date.now() > Number(expires)) return null
    const payload = `${userId}:${expires}`
    const expected = createHmac('sha256', secretKey).update(payload).digest('hex')
    if (sig !== expected) return null
    return userId
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = rateLimit(req, { key: 'auth-otp-confirm', windowMs: 5 * 60_000, max: 10 })
  if (rateLimitResponse) return rateLimitResponse

  const cookieStore = await cookies()
  const challenge = cookieStore.get(OTP_COOKIE)?.value
  if (!challenge) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })

  const userId = verifyChallenge(challenge)
  if (!userId) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.totpSecret) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const result = verifySync({ token: code, secret: user.totpSecret })
  if (!result.valid) return NextResponse.json({ error: 'Code incorrect' }, { status: 401 })

  const session = await createSession(userId)
  cookieStore.delete(OTP_COOKIE)
  cookieStore.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    priority: 'high',
  })

  return NextResponse.json({ role: user.role })
}
