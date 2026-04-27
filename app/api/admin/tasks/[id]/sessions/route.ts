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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const sessions = await prisma.timeSession.findMany({
    where: { taskId: id },
    include: { user: { select: { id: true, name: true, pseudo: true } } },
    orderBy: { startedAt: 'desc' },
  })
  return NextResponse.json({ sessions })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const task = await prisma.task.findUnique({ where: { id }, select: { status: true } })
  if (!task) return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 })
  if (task.status === 'DONE' || task.status === 'VALIDATED') {
    return NextResponse.json({ error: 'Impossible de démarrer un chrono sur une tâche verrouillée' }, { status: 403 })
  }
  const session = await prisma.timeSession.create({
    data: { taskId: id, userId: user.id, startedAt: new Date() },
  })
  return NextResponse.json({ session })
}
