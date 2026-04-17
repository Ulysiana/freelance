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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { requestId } = await params
  const { status } = await req.json()
  const request = await prisma.projectRequest.update({
    where: { id: requestId },
    data: { status },
    include: { author: { select: { id: true, name: true, pseudo: true, role: true } } },
  })
  return NextResponse.json({ request })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { requestId } = await params
  await prisma.projectRequest.delete({ where: { id: requestId } })
  return NextResponse.json({ ok: true })
}
