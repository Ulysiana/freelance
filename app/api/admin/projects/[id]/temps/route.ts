import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { resolveCurrency } from '@/lib/currency'

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

  const [project, settings] = await Promise.all([
    prisma.project.findUnique({ where: { id }, select: { tjm: true, client: { select: { billingCurrency: true } } } }),
    prisma.appSettings.upsert({ where: { id: 'default' }, create: { id: 'default', hoursPerDay: 8, currency: 'EUR' }, update: {} }),
  ])
  if (!project) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const phases = await prisma.phase.findMany({
    where: { projectId: id },
    include: {
      tasks: {
        include: {
          timeSessions: {
            include: { user: { select: { id: true, name: true, pseudo: true } } },
            orderBy: { startedAt: 'desc' },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
  })

  const secondsPerDay = settings.hoursPerDay * 3600
  const costPerSecond = project.tjm / secondsPerDay
  const tasks = phases.flatMap(phase =>
    phase.tasks.map(task => {
      const completedSessions = task.timeSessions.filter(session => session.endedAt && session.durationSeconds != null)
      const totalSeconds = completedSessions.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0)
      const openSession = task.timeSessions.find(session => session.userId === user.id && !session.endedAt)
      return {
        id: task.id,
        title: task.title,
        status: task.status,
        phaseName: phase.name,
        totalSeconds,
        cost: totalSeconds * costPerSecond,
        openSessionId: openSession?.id || null,
        openStartedAt: openSession?.startedAt || null,
        sessions: completedSessions.map(session => ({
          id: session.id,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          durationSeconds: session.durationSeconds,
          user: session.user,
        })),
      }
    })
  )

  return NextResponse.json({ tasks, currency: resolveCurrency(project.client.billingCurrency, settings.currency) })
}
