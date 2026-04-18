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
  const invoices = await prisma.invoice.findMany({
    where: { clientId },
    orderBy: { issuedAt: 'desc' },
  })
  return NextResponse.json({ invoices })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { clientId } = await params

  const formData = await req.formData()
  const number = formData.get('number') as string
  const amount = parseFloat(formData.get('amount') as string)
  const issuedAt = new Date(formData.get('issuedAt') as string)
  const dueAt = formData.get('dueAt') ? new Date(formData.get('dueAt') as string) : null
  const file = formData.get('file') as File | null

  if (!number || isNaN(amount)) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  let filename: string | null = null
  let originalName: string | null = null

  if (file) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() || 'pdf'
    const key = `invoices/${clientId}/${Date.now()}.${ext}`
    await uploadToR2(key, buffer, file.type || 'application/pdf')
    filename = key
    originalName = file.name
  }

  const invoice = await prisma.invoice.create({
    data: { clientId, number, amount, issuedAt, dueAt, filename, originalName },
  })

  return NextResponse.json({ invoice })
}
