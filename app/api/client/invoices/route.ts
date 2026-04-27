import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { resolveCurrency } from '@/lib/currency'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const [settings, invoices] = await Promise.all([
    prisma.appSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', hoursPerDay: 8, currency: 'EUR' },
      update: {},
    }),
    prisma.invoice.findMany({
      where: { clientId: user.id },
      orderBy: { issuedAt: 'desc' },
    }),
  ])
  return NextResponse.json({ invoices, currency: resolveCurrency(user.billingCurrency, settings.currency) })
}
