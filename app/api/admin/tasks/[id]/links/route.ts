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
  const links = await prisma.taskLink.findMany({
    where: { taskId: id },
    orderBy: { createdAt: 'asc' },
    include: { addedBy: { select: { name: true, pseudo: true } } },
  })
  return NextResponse.json({ links })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params
  const { url, title } = await req.json()
  if (!url?.trim()) return NextResponse.json({ error: 'URL requise' }, { status: 400 })
  const link = await prisma.taskLink.create({
    data: { taskId: id, url: url.trim(), title: title?.trim() || null, addedById: user.id },
    include: { addedBy: { select: { name: true, pseudo: true } } },
  })
  return NextResponse.json({ link }, { status: 201 })
}
