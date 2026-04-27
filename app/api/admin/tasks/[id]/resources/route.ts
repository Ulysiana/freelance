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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const resources = await prisma.taskResource.findMany({
    where: { taskId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      file:     { select: { id: true, originalName: true, mimeType: true, size: true } },
      page:     { select: { id: true, title: true } },
      document: { select: { id: true, title: true } },
    },
  })
  return NextResponse.json({ resources })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params
  const { fileId, pageId, docId } = await req.json()
  if (!fileId && !pageId && !docId) return NextResponse.json({ error: 'Ressource manquante' }, { status: 400 })

  // Évite les doublons
  const existing = await prisma.taskResource.findFirst({
    where: { taskId: id, fileId: fileId || null, pageId: pageId || null, docId: docId || null },
  })
  if (existing) return NextResponse.json({ resource: existing })

  const resource = await prisma.taskResource.create({
    data: { taskId: id, fileId: fileId || null, pageId: pageId || null, docId: docId || null },
    include: {
      file:     { select: { id: true, originalName: true, mimeType: true, size: true } },
      page:     { select: { id: true, title: true } },
      document: { select: { id: true, title: true } },
    },
  })
  return NextResponse.json({ resource }, { status: 201 })
}
