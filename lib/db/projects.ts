import { prisma } from './prisma'
import type { ProjectStatus } from '@prisma/client'

export async function getAllProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true, pseudo: true, email: true, billingCurrency: true } },
      collaborators: { include: { collaborator: { select: { id: true, name: true, pseudo: true } } } },
    },
  })
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, pseudo: true, email: true, billingCurrency: true } },
      collaborators: { include: { collaborator: { select: { id: true, name: true, pseudo: true } } } },
      _count: { select: { messages: true, documents: true, requests: true, phases: true, htmlPages: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, content: true, createdAt: true, author: { select: { name: true, pseudo: true, role: true } } } },
      documents: { orderBy: { updatedAt: 'desc' }, take: 3, select: { id: true, title: true, updatedAt: true } },
      requests: { orderBy: { updatedAt: 'desc' }, take: 3, select: { id: true, title: true, status: true, updatedAt: true } },
      phases: { select: { id: true, _count: { select: { tasks: true } }, tasks: { select: { status: true } } } },
    },
  })
}

export async function getProjectsByClientId(clientId: string) {
  return prisma.project.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    include: {
      collaborators: { include: { collaborator: { select: { id: true, name: true, pseudo: true } } } },
    },
  })
}

export async function createProject(data: {
  name: string
  description?: string
  billingType?: string
  tjm: number
  forfaitAmount?: number | null
  clientId: string
  collaboratorIds?: string[]
}) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      billingType: data.billingType || 'TJM',
      tjm: data.tjm,
      forfaitAmount: data.forfaitAmount ?? null,
      clientId: data.clientId,
      collaborators: data.collaboratorIds?.length
        ? { create: data.collaboratorIds.map(id => ({ collaboratorId: id })) }
        : undefined,
    },
    include: {
      client: { select: { id: true, name: true, pseudo: true, email: true, billingCurrency: true } },
      collaborators: { include: { collaborator: { select: { id: true, name: true, pseudo: true } } } },
    },
  })
}

export async function updateProject(id: string, data: {
  name?: string
  description?: string
  billingType?: string
  tjm?: number
  forfaitAmount?: number | null
  status?: ProjectStatus
  clientId?: string
  collaboratorIds?: string[]
}) {
  const { collaboratorIds, ...rest } = data

  if (collaboratorIds !== undefined) {
    await prisma.projectCollaborator.deleteMany({ where: { projectId: id } })
    if (collaboratorIds.length > 0) {
      await prisma.projectCollaborator.createMany({
        data: collaboratorIds.map(cid => ({ projectId: id, collaboratorId: cid })),
      })
    }
  }

  return prisma.project.update({
    where: { id },
    data: rest,
    include: {
      client: { select: { id: true, name: true, pseudo: true, email: true, billingCurrency: true } },
      collaborators: { include: { collaborator: { select: { id: true, name: true, pseudo: true } } } },
    },
  })
}

export async function archiveProject(id: string) {
  return prisma.project.update({ where: { id }, data: { status: 'ARCHIVED' } })
}
