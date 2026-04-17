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
  const pages = await prisma.htmlPage.findMany({
    where: { projectId: id },
    include: { uploadedBy: { select: { id: true, name: true, pseudo: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ pages })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const title = formData.get('title') as string | null

  if (!file || !title?.trim()) return NextResponse.json({ error: 'Fichier et titre requis' }, { status: 400 })
  if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
    return NextResponse.json({ error: 'Seuls les fichiers HTML sont acceptés' }, { status: 400 })
  }

  const filename = `html-pages/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.html`
  const buffer = Buffer.from(await file.arrayBuffer())
  await uploadToR2(filename, buffer, 'text/html')

  const page = await prisma.htmlPage.create({
    data: { projectId: id, uploadedByUserId: user.id, title, filename },
    include: { uploadedBy: { select: { id: true, name: true, pseudo: true } } },
  })
  return NextResponse.json({ page })
}
