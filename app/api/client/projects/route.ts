import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { getProjectsByClientId } from '@/lib/db/projects'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const projects = await getProjectsByClientId(user.id)
  return NextResponse.json({ projects })
}
