import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'session_token'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ user: null })
    const user = await validateSession(token)
    if (!user) {
      const res = NextResponse.json({ user: null })
      res.cookies.delete(COOKIE_NAME)
      return res
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
