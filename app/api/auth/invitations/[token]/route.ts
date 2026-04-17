import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { createUser, createSession } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const inv = await prisma.invitation.findUnique({ where: { token } })
  if (!inv || inv.usedAt || inv.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 })
  }
  return NextResponse.json({ role: inv.role, email: inv.email })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const inv = await prisma.invitation.findUnique({ where: { token } })
  if (!inv || inv.usedAt || inv.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
  }

  const { email, password, name } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (existing) return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 409 })

  const user = await createUser(email, password, name || undefined, undefined, inv.role)
  await prisma.invitation.update({ where: { token }, data: { usedAt: new Date() } })

  const session = await createSession(user.id)
  const cookieStore = await cookies()
  cookieStore.set('session_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return NextResponse.json({ user })
}
