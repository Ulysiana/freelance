import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateUser } from '@/lib/db/users'
import { createHmac, randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const SESSION_COOKIE = 'session_token'
const OTP_COOKIE = 'otp_challenge'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60
const OTP_MAX_AGE = 5 * 60 // 5 minutes

function signChallenge(userId: string): string {
  const expires = Date.now() + OTP_MAX_AGE * 1000
  const payload = `${userId}:${expires}`
  const sig = createHmac('sha256', process.env.SECRET_KEY || 'fallback-secret').update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })

    const result = await authenticateUser(email, password)
    if (!result.success) return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })

    const cookieStore = await cookies()

    // If 2FA enabled, issue a short-lived challenge instead of a session
    if (result.totpEnabled) {
      const challenge = signChallenge(result.user.id)
      cookieStore.set(OTP_COOKIE, challenge, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: OTP_MAX_AGE,
        path: '/',
      })
      return NextResponse.json({ requiresOtp: true, role: result.user.role })
    }

    cookieStore.set(SESSION_COOKIE, result.session!.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
