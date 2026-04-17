import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { deleteFromR2, getSignedDownloadUrl } from '@/lib/storage'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { pageId } = await params
  const page = await prisma.htmlPage.findUnique({ where: { id: pageId } })
  if (!page) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const url = await getSignedUrl(r2, new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: page.filename,
    ResponseContentType: 'text/html',
  }), { expiresIn: 3600 })
  return NextResponse.json({ url })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { pageId } = await params
  const { title } = await req.json()
  const page = await prisma.htmlPage.update({ where: { id: pageId }, data: { title } })
  return NextResponse.json({ page })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { pageId } = await params
  const page = await prisma.htmlPage.findUnique({ where: { id: pageId } })
  if (!page) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await deleteFromR2(page.filename)
  await prisma.htmlPage.delete({ where: { id: pageId } })
  return NextResponse.json({ ok: true })
}
