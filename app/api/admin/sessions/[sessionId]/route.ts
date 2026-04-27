import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { sessionId } = await params
  const existing = await prisma.timeSession.findUnique({ where: { id: sessionId } })
  if (!existing) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  const endedAt = new Date()
  const durationSeconds = Math.round((endedAt.getTime() - existing.startedAt.getTime()) / 1000)
  const session = await prisma.timeSession.update({
    where: { id: sessionId },
    data: { endedAt, durationSeconds },
  })
  return NextResponse.json({ session })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { sessionId } = await params
  const { reason } = await request.json().catch(() => ({ reason: '' }))
  if (!reason || !String(reason).trim()) {
    return NextResponse.json({ error: 'Motif de suppression requis' }, { status: 400 })
  }
  const existing = await prisma.timeSession.findUnique({
    where: { id: sessionId },
    include: { task: { select: { status: true } } },
  })
  if (!existing) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  if (!existing.endedAt || existing.durationSeconds == null) {
    return NextResponse.json({ error: 'Seules les sessions terminées peuvent être supprimées' }, { status: 400 })
  }
  if (existing.task.status === 'DONE' || existing.task.status === 'VALIDATED') {
    return NextResponse.json({ error: 'Impossible de supprimer du temps sur une tâche verrouillée' }, { status: 403 })
  }
  await prisma.$transaction([
    prisma.timeSessionDeletionLog.create({
      data: {
        sessionId: existing.id,
        taskId: existing.taskId,
        userId: existing.userId,
        startedAt: existing.startedAt,
        endedAt: existing.endedAt,
        durationSeconds: existing.durationSeconds,
        reason: String(reason).trim(),
        deletedById: user.id,
      },
    }),
    prisma.timeSession.delete({ where: { id: sessionId } }),
  ])
  return NextResponse.json({ ok: true })
}
