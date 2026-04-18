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
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const since7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [settings, projects, recentMessages, recentRequests, recentDocs, invoicesPending] = await Promise.all([
    prisma.appSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', hoursPerDay: 8, currency: 'EUR' },
      update: {},
    }),
    prisma.project.findMany({
      where: { clientId: user.id, status: { not: 'ARCHIVED' } },
      orderBy: { updatedAt: 'desc' },
      include: {
        phases: {
          include: { tasks: { select: { id: true, status: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { author: { select: { name: true, pseudo: true, role: true } } },
        },
        documents: {
          orderBy: { updatedAt: 'desc' },
          take: 3,
          select: { id: true, title: true, updatedAt: true },
        },
        requests: {
          orderBy: { updatedAt: 'desc' },
          take: 3,
          select: { id: true, title: true, status: true, updatedAt: true },
        },
      },
    }),

    prisma.message.findMany({
      where: {
        project: { clientId: user.id },
        createdAt: { gte: since7days },
        author: { role: { not: 'CLIENT' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        author: { select: { name: true, pseudo: true, role: true } },
        project: { select: { id: true, name: true } },
      },
    }),

    prisma.projectRequest.findMany({
      where: {
        project: { clientId: user.id },
        status: { not: 'PENDING' },
        updatedAt: { gte: since7days },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { project: { select: { id: true, name: true } } },
    }),

    prisma.document.findMany({
      where: { project: { clientId: user.id }, updatedAt: { gte: since7days } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, updatedAt: true, project: { select: { id: true, name: true } } },
    }),

    prisma.invoice.findMany({
      where: { clientId: user.id, status: 'PENDING' },
      select: { id: true, number: true, amount: true, dueAt: true },
    }),
  ])

  // Time sessions aggregated per project
  const projectIds = projects.map(p => p.id)
  const timeSessions = await prisma.timeSession.findMany({
    where: { task: { phase: { projectId: { in: projectIds } } } },
    select: {
      durationSeconds: true,
      task: { select: { phase: { select: { projectId: true } } } },
    },
  })

  const timeByProject: Record<string, number> = {}
  for (const s of timeSessions) {
    const pid = s.task.phase.projectId
    timeByProject[pid] = (timeByProject[pid] || 0) + (s.durationSeconds || 0)
  }

  const projectsWithTime = projects.map(p => ({
    ...p,
    totalSeconds: timeByProject[p.id] || 0,
    estimatedCost: p.tjm > 0 ? ((timeByProject[p.id] || 0) / 28800) * p.tjm : null,
  }))

  return NextResponse.json({
    currency: settings.currency,
    projects: projectsWithTime,
    recentMessages,
    recentRequests,
    recentDocs,
    invoicesPending,
  })
}
