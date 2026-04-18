import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { getSignedDownloadUrl, getSignedViewUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

export async function GET(_: NextRequest, { params }: { params: Promise<{ attachmentId: string }> }) {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { attachmentId } = await params
  const att = await prisma.attachment.findUnique({ where: { id: attachmentId } })
  if (!att) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const url = await getSignedViewUrl(att.filename, att.mimeType)
  return NextResponse.json({ url })
}
