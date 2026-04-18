import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params

  const [project, settings] = await Promise.all([
    prisma.project.findUnique({
      where: { id, clientId: user.id },
      select: { tjm: true },
    }),
    prisma.appSettings.upsert({ where: { id: 'default' }, create: { id: 'default', hoursPerDay: 8 }, update: {} }),
  ])

  if (!project) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const sessions = await prisma.timeSession.aggregate({
    _sum: { durationSeconds: true },
    where: {
      task: { phase: { projectId: id } },
      endedAt: { not: null },
    },
  })

  const totalSeconds = sessions._sum.durationSeconds || 0
  const secondsPerDay = settings.hoursPerDay * 3600
  const cost = (totalSeconds / secondsPerDay) * project.tjm

  return NextResponse.json({ totalSeconds, cost, hoursPerDay: settings.hoursPerDay })
}
