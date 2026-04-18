import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { getSignedViewUrl, getSignedDownloadUrl } from '@/lib/storage'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { invoiceId } = await params
  const { status } = await req.json()
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status, paidAt: status === 'PAID' ? new Date() : null },
  })
  return NextResponse.json({ invoice })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  const user = await requireAuth()
  if (!user || user.role === 'CLIENT') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  const { invoiceId } = await params
  await prisma.invoice.delete({ where: { id: invoiceId } })
  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { invoiceId } = await params
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  if (user.role === 'CLIENT' && invoice.clientId !== user.id) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
  if (!invoice.filename) return NextResponse.json({ error: 'Pas de fichier' }, { status: 404 })
  const download = req.nextUrl.searchParams.get('download') === '1'
  const url = download
    ? await getSignedDownloadUrl(invoice.filename, invoice.originalName || 'facture.pdf')
    : await getSignedViewUrl(invoice.filename, 'application/pdf')
  return NextResponse.json({ url })
}
