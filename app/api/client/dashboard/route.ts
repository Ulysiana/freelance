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

  const projects = await prisma.project.findMany({
    where: { clientId: user.id, status: { not: 'ARCHIVED' } },
    orderBy: { updatedAt: 'desc' },
    include: {
      phases: {
        include: {
          tasks: { select: { id: true, status: true } },
        },
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
  })

  // Recent activity across all projects (last 7 days)
  const recentMessages = await prisma.message.findMany({
    where: {
      project: { clientId: user.id },
      createdAt: { gte: since7days },
      author: { role: { not: 'CLIENT' } }, // only messages from admin/collab
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      author: { select: { name: true, pseudo: true, role: true } },
      project: { select: { id: true, name: true } },
    },
  })

  const recentRequests = await prisma.projectRequest.findMany({
    where: {
      project: { clientId: user.id },
      status: { not: 'PENDING' },
      updatedAt: { gte: since7days },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: { project: { select: { id: true, name: true } } },
  })

  const recentDocs = await prisma.document.findMany({
    where: {
      project: { clientId: user.id },
      updatedAt: { gte: since7days },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: { id: true, title: true, updatedAt: true, project: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ projects, recentMessages, recentRequests, recentDocs })
}
