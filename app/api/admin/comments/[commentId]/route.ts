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

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { commentId } = await params
  const comment = await prisma.taskComment.findUnique({ where: { id: commentId } })
  if (!comment) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (comment.authorId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }
  await prisma.taskComment.delete({ where: { id: commentId } })
  return NextResponse.json({ ok: true })
}
