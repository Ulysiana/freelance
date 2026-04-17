import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = (await cookies()).get('session_token')?.value
  if (!token) return NextResponse.json({ user: null })
  const user = await validateSession(token)
  return NextResponse.json({ user })
}
