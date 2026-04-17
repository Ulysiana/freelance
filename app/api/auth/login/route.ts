import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateUser } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'session_token'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const result = await authenticateUser(email, password)

    if (!result.success) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, result.session.token, {
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
