import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession, updateUser, deleteUser } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import type { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'
const COOKIE_NAME = 'session_token'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const user = await validateSession(token)
  return user?.role === 'ADMIN' ? user : null
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, company: true, address: true, role: true, createdAt: true, pseudo: true },
  })
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  const { name, pseudo, email, password, role } = await request.json()
  const user = await updateUser(id, { name, pseudo, email, password, role: role as Role | undefined })
  return NextResponse.json({ user })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { id } = await params
  if (id === admin.id) return NextResponse.json({ error: 'Impossible de se supprimer soi-même' }, { status: 400 })
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
  if (target?.role === 'CLIENT') {
    const count = await prisma.project.count({ where: { clientId: id } })
    if (count > 0) return NextResponse.json({ error: `Ce client a ${count} projet${count > 1 ? 's' : ''} — impossible de le supprimer.` }, { status: 400 })
  }
  await deleteUser(id)
  return NextResponse.json({ ok: true })
}
