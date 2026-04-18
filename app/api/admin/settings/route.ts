import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAdmin() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  const user = await validateSession(token)
  return user?.role === 'ADMIN' ? user : null
}

async function getSettings() {
  return prisma.appSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', hoursPerDay: 8 },
    update: {},
  })
}

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json({ hoursPerDay: settings.hoursPerDay })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { hoursPerDay } = await req.json()
  if (typeof hoursPerDay !== 'number' || hoursPerDay <= 0 || hoursPerDay > 24) {
    return NextResponse.json({ error: 'Valeur invalide (entre 1 et 24)' }, { status: 400 })
  }
  const settings = await prisma.appSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', hoursPerDay },
    update: { hoursPerDay },
  })
  return NextResponse.json({ hoursPerDay: settings.hoursPerDay })
}
