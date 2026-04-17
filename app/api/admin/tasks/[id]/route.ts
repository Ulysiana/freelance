import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { getTaskById, updateTask, deleteTask } from '@/lib/db/phases'
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
  const { title, description, status } = await req.json()
  const task = await updateTask(id, { title, description, status: status as TaskStatus | undefined })
  return NextResponse.json({ task })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  await deleteTask(id)
  return NextResponse.json({ ok: true })
}
