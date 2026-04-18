import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/db/users'
import { validatePassword } from '@/lib/password'
import { verifyPasswordResetToken } from '@/lib/password-reset'
import { rateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const result = await verifyPasswordResetToken(token)

  if (!result.valid) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 })
  }

  return NextResponse.json({
    email: result.user.email,
    name: result.user.name,
    expiresAt: result.expiresAt.toISOString(),
  })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const limited = rateLimit(request, { key: 'auth-password-reset-confirm', windowMs: 15 * 60_000, max: 10 })
  if (limited) return limited

  const { token } = await params
  const result = await verifyPasswordResetToken(token)

  if (!result.valid) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
  }

  try {
    const { password } = await request.json()
    const pwdError = validatePassword(String(password || ''))
    if (pwdError) {
      return NextResponse.json({ error: pwdError }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: result.user.id },
        data: { passwordHash },
      }),
      prisma.session.deleteMany({
        where: { userId: result.user.id },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return NextResponse.json({ error: 'Impossible de mettre à jour le mot de passe.' }, { status: 500 })
  }
}
