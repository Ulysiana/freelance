import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

const CURRENCIES = ['EUR', 'USD', 'GBP']

async function requireAdmin() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  const user = await validateSession(token)
  return user?.role === 'ADMIN' ? user : null
}

async function getSettings() {
  return prisma.appSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', hoursPerDay: 8, currency: 'EUR' },
    update: {},
  })
}

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json({ hoursPerDay: settings.hoursPerDay, currency: settings.currency })
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const body = await req.json()
  const updates: { hoursPerDay?: number; currency?: string } = {}

  if (body.hoursPerDay !== undefined) {
    if (typeof body.hoursPerDay !== 'number' || body.hoursPerDay <= 0 || body.hoursPerDay > 24)
      return NextResponse.json({ error: 'Valeur invalide (entre 1 et 24)' }, { status: 400 })
    updates.hoursPerDay = body.hoursPerDay
  }

  if (body.currency !== undefined) {
    if (!CURRENCIES.includes(body.currency))
      return NextResponse.json({ error: 'Devise invalide' }, { status: 400 })
    updates.currency = body.currency
  }

  const settings = await prisma.appSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', hoursPerDay: 8, currency: 'EUR', ...updates },
    update: updates,
  })
  return NextResponse.json({ hoursPerDay: settings.hoursPerDay, currency: settings.currency })
}
