import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession, getAllUsers, createUser } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { CURRENCIES } from '@/lib/currency'
import { validatePassword } from '@/lib/password'
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

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const users = await getAllUsers()
  const projectCounts = await prisma.project.groupBy({ by: ['clientId'], _count: { id: true } })
  const countMap = Object.fromEntries(projectCounts.map(r => [r.clientId, r._count.id]))
  const usersWithCount = users.map(u => ({ ...u, projectCount: countMap[u.id] ?? 0 }))
  return NextResponse.json({ users: usersWithCount })
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  const { email, password, name, pseudo, role, billingCurrency } = await request.json()
  if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  const pwdError = validatePassword(password)
  if (pwdError) return NextResponse.json({ error: pwdError }, { status: 400 })
  if (billingCurrency !== undefined && billingCurrency !== null && !CURRENCIES.includes(billingCurrency)) {
    return NextResponse.json({ error: 'Devise invalide' }, { status: 400 })
  }
  try {
    const user = await createUser(email, password, name, pseudo, (role as Role) || 'CLIENT', billingCurrency ?? null)
    return NextResponse.json({ user }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
  }
}
