import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { deleteFromR2, getSignedViewUrl, getSignedDownloadUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { fileId } = await params
  const file = await prisma.clientFile.findUnique({ where: { id: fileId } })
  if (!file) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (user.role === 'CLIENT' && file.clientId !== user.id) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const download = req.nextUrl.searchParams.get('download') === '1'
  const url = download
    ? await getSignedDownloadUrl(file.filename, file.originalName)
    : await getSignedViewUrl(file.filename, file.mimeType)
  return NextResponse.json({ url })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { fileId } = await params
  const file = await prisma.clientFile.findUnique({ where: { id: fileId } })
  if (!file) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await deleteFromR2(file.filename)
  await prisma.clientFile.delete({ where: { id: fileId } })
  return NextResponse.json({ ok: true })
}
