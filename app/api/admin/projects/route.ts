import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { getAllProjects, createProject } from '@/lib/db/projects'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAdmin() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  const user = await validateSession(token)
  return user?.role === 'ADMIN' ? user : null
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const clientId = req.nextUrl.searchParams.get('clientId')
  const projects = clientId
    ? await getAllProjects().then(all => all.filter((p: { clientId: string }) => p.clientId === clientId))
    : await getAllProjects()
  return NextResponse.json({ projects })
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { name, description, tjm, clientId, collaboratorIds } = await req.json()
  if (!name || !clientId) return NextResponse.json({ error: 'Nom et client requis' }, { status: 400 })
  const project = await createProject({ name, description, tjm: parseFloat(tjm) || 0, clientId, collaboratorIds })
  return NextResponse.json({ project }, { status: 201 })
}
