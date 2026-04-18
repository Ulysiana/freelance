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

export async function GET(_: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { docId } = await params
  const doc = await prisma.document.findFirst({
    where: { id: docId, project: projectAccessWhere(user) },
    include: { author: { select: { id: true, name: true, pseudo: true } }, project: { select: { id: true, name: true } } },
  })
  if (!doc) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json({ document: doc })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { docId } = await params
  const { title, content } = await req.json()
  const existing = await prisma.document.findFirst({
    where: { id: docId, project: projectAccessWhere(user) },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const doc = await prisma.document.update({
    where: { id: docId },
    data: { ...(title !== undefined && { title }), ...(content !== undefined && { content }) },
  })
  return NextResponse.json({ document: doc })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { docId } = await params
  const existing = await prisma.document.findFirst({
    where: { id: docId, project: projectAccessWhere(user) },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  await prisma.document.delete({ where: { id: docId } })
  return NextResponse.json({ ok: true })
}
