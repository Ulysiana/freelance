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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const { checked, label } = await req.json()
  const existing = await prisma.todoItem.findUnique({ where: { id }, include: { task: { select: { status: true } } } })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (existing.task.status === 'DONE' || existing.task.status === 'VALIDATED') {
    return NextResponse.json({ error: 'Checklist verrouillée sur une tâche terminée' }, { status: 403 })
  }
  const todo = await prisma.todoItem.update({
    where: { id },
    data: { ...(checked !== undefined && { checked }), ...(label !== undefined && { label }) },
  })
  return NextResponse.json({ todo })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const existing = await prisma.todoItem.findUnique({ where: { id }, include: { task: { select: { status: true } } } })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (existing.task.status === 'DONE' || existing.task.status === 'VALIDATED') {
    return NextResponse.json({ error: 'Checklist verrouillée sur une tâche terminée' }, { status: 403 })
  }
  await prisma.todoItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
