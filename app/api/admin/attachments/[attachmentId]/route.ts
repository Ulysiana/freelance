import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { deleteFromR2, getSignedDownloadUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ attachmentId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { attachmentId } = await params
  const att = await prisma.attachment.findUnique({ where: { id: attachmentId } })
  if (!att) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const url = await getSignedDownloadUrl(att.filename, att.originalName)
  return NextResponse.redirect(url)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ attachmentId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { attachmentId } = await params
  const att = await prisma.attachment.findUnique({ where: { id: attachmentId }, include: { task: { select: { status: true } } } })
  if (!att) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (att.task.status === 'DONE' || att.task.status === 'VALIDATED') {
    return NextResponse.json({ error: 'Pièces jointes verrouillées sur une tâche terminée' }, { status: 403 })
  }
  await deleteFromR2(att.filename)
  await prisma.attachment.delete({ where: { id: attachmentId } })
  return NextResponse.json({ ok: true })
}
