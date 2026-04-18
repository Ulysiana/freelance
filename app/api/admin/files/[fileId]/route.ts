import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { deleteFromR2 } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { fileId } = await params
  const file = await prisma.projectFile.findUnique({ where: { id: fileId } })
  if (!file) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await deleteFromR2(file.filename)
  await prisma.projectFile.delete({ where: { id: fileId } })
  return NextResponse.json({ ok: true })
}
