import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params

  const phases = await prisma.phase.findMany({
    where: { projectId: id },
    orderBy: { order: 'asc' },
    include: {
      phaseLinks: {
        orderBy: { createdAt: 'asc' },
        include: { addedBy: { select: { name: true, pseudo: true } } },
      },
      tasks: {
        orderBy: { createdAt: 'asc' },
        include: {
          links: {
            orderBy: { createdAt: 'asc' },
            include: { addedBy: { select: { name: true, pseudo: true } } },
          },
        },
      },
    },
  })

  return NextResponse.json({ phases })
}
