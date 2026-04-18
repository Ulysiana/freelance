import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { uploadToR2 } from '@/lib/storage'

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
  const files = await prisma.projectFile.findMany({
    where: { projectId: id },
    orderBy: { uploadedAt: 'desc' },
    include: { uploadedBy: { select: { name: true, pseudo: true } } },
  })
  return NextResponse.json({ files })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { id } = await params

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop() || 'bin'
  const key = `project-files/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  await uploadToR2(key, buffer, file.type || 'application/octet-stream')

  const projectFile = await prisma.projectFile.create({
    data: {
      projectId: id,
      uploadedById: user.id,
      filename: key,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    },
    include: { uploadedBy: { select: { name: true, pseudo: true } } },
  })

  return NextResponse.json({ file: projectFile })
}
