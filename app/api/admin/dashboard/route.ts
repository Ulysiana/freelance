import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

export async function GET() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const user = await validateSession(token)
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const settings = await prisma.appSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', hoursPerDay: 8 },
    update: {},
  })
  const secondsPerDay = settings.hoursPerDay * 3600

  const [
    activeProjects,
    totalProjects,
    totalClients,
    pendingRequests,
    timeThisMonth,
    recentMessages,
    recentRequests,
    tasksByStatus,
    clientsWithProjects,
  ] = await Promise.all([
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.project.count(),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.projectRequest.count({ where: { status: 'PENDING' } }),
    prisma.timeSession.aggregate({
      _sum: { durationSeconds: true },
      where: { startedAt: { gte: startOfMonth }, durationSeconds: { not: null } },
    }),
    prisma.message.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, pseudo: true, role: true } },
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.projectRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'PENDING' },
      include: {
        author: { select: { name: true, pseudo: true } },
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.user.findMany({
      where: { role: 'CLIENT' },
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, pseudo: true, email: true,
        projectsAsClient: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true, name: true, status: true, updatedAt: true,
            _count: { select: { messages: true, requests: true } },
          },
        },
      },
    }),
  ])

  const revenueData = await prisma.timeSession.findMany({
    where: { startedAt: { gte: startOfMonth }, durationSeconds: { not: null } },
    include: { task: { include: { phase: { include: { project: { select: { tjm: true } } } } } } },
  })
  const revenueThisMonth = revenueData.reduce((sum, s) => {
    const tjm = s.task.phase.project.tjm
    return sum + ((s.durationSeconds || 0) / secondsPerDay) * tjm
  }, 0)

  return NextResponse.json({
    stats: {
      activeProjects,
      totalProjects,
      totalClients,
      pendingRequests,
      timeSecondsThisMonth: timeThisMonth._sum.durationSeconds || 0,
      revenueThisMonth: Math.round(revenueThisMonth),
    },
    tasksByStatus: Object.fromEntries(tasksByStatus.map(t => [t.status, t._count.id])),
    recentMessages,
    recentRequests,
    clientsWithProjects,
  })
}
