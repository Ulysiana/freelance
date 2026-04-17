import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { uploadToR2 } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'
const MAX_SIZE = 20 * 1024 * 1024 // 20MB

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const taskId = formData.get('taskId') as string | null

  if (!file || !taskId) return NextResponse.json({ error: 'Fichier et taskId requis' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Fichier trop lourd (max 20MB)' }, { status: 400 })

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { phase: { include: { project: true } } },
  })
  if (!task) return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 })

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const key = `clients/${task.phase.project.clientId}/${task.phase.project.id}/${taskId}/${filename}`

  const buffer = Buffer.from(await file.arrayBuffer())
  await uploadToR2(key, buffer, file.type)

  const attachment = await prisma.attachment.create({
    data: {
      taskId,
      uploadedByUserId: user.id,
      filename: key,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    },
    include: { uploadedBy: { select: { id: true, name: true, pseudo: true } } },
  })

  return NextResponse.json({ attachment })
}
