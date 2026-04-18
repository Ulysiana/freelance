import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { getSignedViewUrl, getSignedDownloadUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

export async function GET(req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { fileId } = await params
  const file = await prisma.projectFile.findUnique({ where: { id: fileId } })
  if (!file) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const download = req.nextUrl.searchParams.get('download') === '1'
  const url = download
    ? await getSignedDownloadUrl(file.filename, file.originalName)
    : await getSignedViewUrl(file.filename, file.mimeType)

  return NextResponse.json({ url })
}
