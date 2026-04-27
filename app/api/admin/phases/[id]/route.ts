import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { updatePhase, deletePhase, createTask } from '@/lib/db/phases'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const data = await req.json()
  const phase = await updatePhase(id, data)
  return NextResponse.json({ phase })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const phase = await prisma.phase.findUnique({
    where: { id },
    include: { tasks: { select: { status: true } } },
  })
  if (!phase) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (phase.tasks.length > 0 && phase.tasks.every(task => task.status === 'VALIDATED')) {
    return NextResponse.json({ error: 'Impossible de supprimer une phase entièrement validée' }, { status: 403 })
  }
  await deletePhase(id)
  return NextResponse.json({ ok: true })
}

// POST /api/admin/phases/[id] → créer une tâche dans cette phase
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const { title, description } = await req.json()
  const task = await createTask(id, title, description)
  return NextResponse.json({ task }, { status: 201 })
}
