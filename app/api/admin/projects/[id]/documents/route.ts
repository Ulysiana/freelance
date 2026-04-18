import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { projectAccessWhere } from '@/lib/projectAccess'

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
  const project = await prisma.project.findFirst({
    where: { id, ...projectAccessWhere(user) },
    select: { id: true },
  })
  if (!project) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const documents = await prisma.document.findMany({
    where: { projectId: id },
    include: { author: { select: { id: true, name: true, pseudo: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ documents })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const { title } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  const doc = await prisma.document.create({
    data: { projectId: id, authorId: user.id, title, content: '' },
    include: { author: { select: { id: true, name: true, pseudo: true } } },
  })
  return NextResponse.json({ document: doc })
}
