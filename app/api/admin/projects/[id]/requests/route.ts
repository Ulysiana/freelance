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
  const requests = await prisma.projectRequest.findMany({
    where: { projectId: id },
    include: {
      author: { select: { id: true, name: true, pseudo: true, role: true } },
      phase:  { select: { id: true, name: true } },
      task:   { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ requests })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (user.role !== 'CLIENT') return NextResponse.json({ error: 'Seul un client peut créer une demande' }, { status: 403 })
  const { id } = await params
  const { title, description } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  const request = await prisma.projectRequest.create({
    data: { projectId: id, authorId: user.id, title, description },
    include: { author: { select: { id: true, name: true, pseudo: true, role: true } } },
  })
  return NextResponse.json({ request })
}
