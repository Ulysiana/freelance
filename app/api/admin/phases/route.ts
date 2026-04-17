import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { getPhasesWithTasks, createPhase } from '@/lib/db/phases'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function GET(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const projectId = req.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId requis' }, { status: 400 })
  const phases = await getPhasesWithTasks(projectId)
  return NextResponse.json({ phases })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { projectId, name, order } = await req.json()
  const phase = await createPhase(projectId, name, order ?? 0)
  return NextResponse.json({ phase }, { status: 201 })
}
