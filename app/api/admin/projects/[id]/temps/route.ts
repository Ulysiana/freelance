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

  const [project, settings] = await Promise.all([
    prisma.project.findUnique({ where: { id }, select: { tjm: true } }),
    prisma.appSettings.upsert({ where: { id: 'default' }, create: { id: 'default', hoursPerDay: 8 }, update: {} }),
  ])
  if (!project) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const phases = await prisma.phase.findMany({
    where: { projectId: id },
    include: {
      tasks: {
        include: {
          timeSessions: { where: { endedAt: { not: null } } },
        },
      },
    },
    orderBy: { order: 'asc' },
  })

  const secondsPerDay = settings.hoursPerDay * 3600
  const costPerSecond = project.tjm / secondsPerDay
  const tasks = phases.flatMap(phase =>
    phase.tasks.map(task => {
      const totalSeconds = task.timeSessions.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0)
      return {
        id: task.id,
        title: task.title,
        status: task.status,
        phaseName: phase.name,
        totalSeconds,
        cost: totalSeconds * costPerSecond,
      }
    })
  )

  return NextResponse.json({ tasks })
}
