import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { getProjectById, updateProject, archiveProject } from '@/lib/db/projects'
import type { ProjectStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAdmin() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  const user = await validateSession(token)
  return user?.role === 'ADMIN' ? user : null
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const project = await getProjectById(id)
  if (!project) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json({ project })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const { name, description, tjm, status, clientId, collaboratorIds } = await req.json()
  const project = await updateProject(id, {
    name, description, clientId, collaboratorIds,
    tjm: tjm !== undefined ? parseFloat(tjm) : undefined,
    status: status as ProjectStatus | undefined,
  })
  return NextResponse.json({ project })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  await archiveProject(id)
  return NextResponse.json({ ok: true })
}
