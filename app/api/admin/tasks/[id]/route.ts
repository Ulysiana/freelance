import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { getTaskById, updateTask, deleteTask } from '@/lib/db/phases'
import { prisma } from '@/lib/db/prisma'
import type { TaskStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const task = await getTaskById(id)
  if (!task) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json({ task })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const { title, description, status, adminUnlock } = await req.json()
  const existing = await getTaskById(id)
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const nextStatus = status as TaskStatus | undefined
  const normalizedIncomingTitle = typeof title === 'string' ? title : undefined
  const normalizedIncomingDescription = typeof description === 'string' ? description : description === null ? '' : undefined
  const existingDescription = existing.description || ''
  const hasTitleChange = normalizedIncomingTitle !== undefined && normalizedIncomingTitle !== existing.title
  const hasDescriptionChange = normalizedIncomingDescription !== undefined && normalizedIncomingDescription !== existingDescription
  const hasContentChanges = hasTitleChange || hasDescriptionChange

  if ((existing.status === 'DONE' || existing.status === 'VALIDATED') && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Cette tâche est verrouillée' }, { status: 403 })
  }

  if (existing.status === 'DONE' || existing.status === 'VALIDATED') {
    const adminUnlocking =
      user.role === 'ADMIN' &&
      adminUnlock === true &&
      nextStatus !== undefined &&
      nextStatus !== 'VALIDATED'

    if (!adminUnlocking && (hasContentChanges || nextStatus !== undefined && nextStatus !== existing.status)) {
      if (existing.status === 'DONE' && user.role === 'CLIENT' && nextStatus === 'VALIDATED' && !hasContentChanges) {
        // Client validation allowed below.
      } else {
        return NextResponse.json({ error: 'Déverrouille la tâche avant de la modifier' }, { status: 403 })
      }
    }
  }

  if (user.role === 'CLIENT') {
    if (title !== undefined || description !== undefined) {
      return NextResponse.json({ error: 'Le client ne peut pas modifier le contenu de la tâche' }, { status: 403 })
    }
    if (nextStatus !== 'VALIDATED') {
      return NextResponse.json({ error: 'Le client ne peut que valider une tâche terminée' }, { status: 403 })
    }
    if (existing.status !== 'DONE') {
      return NextResponse.json({ error: 'Seules les tâches terminées peuvent être validées' }, { status: 400 })
    }
  }

  if (user.role === 'COLLABORATEUR') {
    if (nextStatus === 'VALIDATED') {
      return NextResponse.json({ error: 'Seul le client ou un admin peut valider une tâche' }, { status: 403 })
    }
  }

  if (user.role === 'ADMIN' && existing.status !== 'VALIDATED' && nextStatus === 'VALIDATED') {
    return NextResponse.json({ error: 'La validation reste réservée au client' }, { status: 403 })
  }

  if ((nextStatus === 'DONE' || nextStatus === 'VALIDATED') && existing.status !== nextStatus) {
    const openSessions = await prisma.timeSession.count({
      where: { taskId: id, endedAt: null },
    })
    if (openSessions > 0) {
      return NextResponse.json({ error: 'Arrête le chrono en cours avant de terminer la tâche' }, { status: 400 })
    }
  }

  const task = await updateTask(id, {
    title: user.role === 'CLIENT' ? undefined : title,
    description: user.role === 'CLIENT' ? undefined : description,
    status: nextStatus,
  })
  return NextResponse.json({ task })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  await deleteTask(id)
  return NextResponse.json({ ok: true })
}
