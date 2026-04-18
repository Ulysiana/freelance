import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'
import { projectAccessWhere } from '@/lib/projectAccess'
import { createDocumentComment, listDocumentComments } from '@/lib/documentComments'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

async function findAccessibleDocument(docId: string, user: NonNullable<Awaited<ReturnType<typeof requireAuth>>>) {
  return prisma.document.findFirst({
    where: {
      id: docId,
      project: projectAccessWhere(user),
    },
    select: { id: true },
  })
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { docId } = await params
  const doc = await findAccessibleDocument(docId, user)
  if (!doc) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const comments = await listDocumentComments(docId)
  return NextResponse.json({ comments })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { docId } = await params
  const doc = await findAccessibleDocument(docId, user)
  if (!doc) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Contenu requis' }, { status: 400 })

  const comment = await createDocumentComment(docId, user.id, content.trim())
  return NextResponse.json({ comment })
}
