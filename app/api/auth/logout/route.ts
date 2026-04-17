import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'session_token'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (token) await deleteSession(token)
    cookieStore.delete(COOKIE_NAME)
    return NextResponse.json({ message: 'Déconnexion réussie' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
