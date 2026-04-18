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

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { sessionId } = await params
  await prisma.timeSession.delete({ where: { id: sessionId } })
  return NextResponse.json({ ok: true })
}
