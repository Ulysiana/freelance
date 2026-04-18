import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireClient() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function GET() {
  const user = await requireClient()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, company: true, address: true },
  })
  return NextResponse.json({ profile })
}

export async function PATCH(req: NextRequest) {
  const user = await requireClient()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { name, phone, company, address } = await req.json()
  const profile = await prisma.user.update({
    where: { id: user.id },
    data: { name, phone, company, address },
    select: { id: true, name: true, email: true, phone: true, company: true, address: true },
  })
  return NextResponse.json({ profile })
}
