import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { uploadToR2 } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAdmin() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  const user = await validateSession(token)
  if (!user || user.role === 'CLIENT') return null
  return user
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { clientId } = await params
  const contracts = await prisma.clientFile.findMany({
    where: { clientId },
    orderBy: { uploadedAt: 'desc' },
    include: { uploadedBy: { select: { name: true, pseudo: true } } },
  })
  return NextResponse.json({ contracts })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { clientId } = await params

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const label = formData.get('label') as string | null
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop() || 'bin'
  const key = `client-files/${clientId}/${Date.now()}.${ext}`

  await uploadToR2(key, buffer, file.type || 'application/octet-stream')

  const contract = await prisma.clientFile.create({
    data: {
      clientId,
      uploadedById: user.id,
      filename: key,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      label: label || null,
    },
    include: { uploadedBy: { select: { name: true, pseudo: true } } },
  })

  return NextResponse.json({ contract })
}
