import { prisma } from './prisma'
import type { TaskStatus } from '@prisma/client'

export async function getPhasesWithTasks(projectId: string) {
  return prisma.phase.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
    include: {
      tasks: { orderBy: { createdAt: 'asc' } },
    },
  })
}

export async function createPhase(projectId: string, name: string, order: number) {
  return prisma.phase.create({ data: { projectId, name, order } })
}

export async function updatePhase(id: string, data: { name?: string; order?: number }) {
  return prisma.phase.update({ where: { id }, data })
}

export async function deletePhase(id: string) {
  return prisma.phase.delete({ where: { id } })
}

export async function createTask(phaseId: string, title: string, description?: string) {
  return prisma.task.create({ data: { phaseId, title, description } })
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      phase: { include: { project: true } },
      todos: { orderBy: { order: 'asc' } },
    },
  })
}

export async function updateTask(id: string, data: { title?: string; description?: string; status?: TaskStatus }) {
  return prisma.task.update({ where: { id }, data })
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } })
}
