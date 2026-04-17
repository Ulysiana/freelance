import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'
const COOKIE = 'session_token'

async function requireAuth() {
  const token = (await cookies()).get(COOKIE)?.value
  if (!token) return null
  return validateSession(token)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id: taskId } = await params
  const { label } = await req.json()
  if (!label?.trim()) return NextResponse.json({ error: 'Label requis' }, { status: 400 })

  const count = await prisma.todoItem.count({ where: { taskId } })
  const todo = await prisma.todoItem.create({ data: { taskId, label: label.trim(), order: count } })
  return NextResponse.json({ todo }, { status: 201 })
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id: taskId } = await params
  const todos = await prisma.todoItem.findMany({ where: { taskId }, orderBy: { order: 'asc' } })
  return NextResponse.json({ todos })
}
