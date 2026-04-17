import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateSync, verifySync, generateSecret } from 'otplib'
import { toDataURL } from 'qrcode'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

function otpAuthUri(email: string, secret: string) {
  return `otpauth://totp/${encodeURIComponent('Creahub Solutions')}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent('Creahub Solutions')}`
}

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const secret = generateSecret()
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret, totpEnabled: false } })

  const uri = otpAuthUri(user.email, secret)
  const qrDataUrl = await toDataURL(uri)

  return NextResponse.json({ qrDataUrl, secret })
}

export async function POST(req: Request) {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { code } = await req.json()
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser?.totpSecret) return NextResponse.json({ error: 'Aucun secret configuré' }, { status: 400 })

  const result = verifySync({ token: code, secret: dbUser.totpSecret })
  if (!result.valid) return NextResponse.json({ error: 'Code incorrect' }, { status: 400 })

  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false } })
  return NextResponse.json({ ok: true })
}
