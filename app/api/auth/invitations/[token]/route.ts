import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { createUser, createSession } from '@/lib/db/users'
import { validatePassword } from '@/lib/password'
import { rateLimit } from '@/lib/security'

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
  const rateLimitResponse = rateLimit(req, { key: 'auth-invitation-accept', windowMs: 15 * 60_000, max: 10 })
  if (rateLimitResponse) return rateLimitResponse

  const { token } = await params
  const inv = await prisma.invitation.findUnique({ where: { token } })
  if (!inv || inv.usedAt || inv.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
  }

  const { email, password, name } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  const pwdError = validatePassword(password)
  if (pwdError) return NextResponse.json({ error: pwdError }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (existing) return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 409 })

  const user = await createUser(email, password, name || undefined, undefined, inv.role)
  await prisma.invitation.update({ where: { token }, data: { usedAt: new Date() } })

  const session = await createSession(user.id)
  const cookieStore = await cookies()
  cookieStore.set('session_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
    priority: 'high',
  })

  return NextResponse.json({ user })
}
