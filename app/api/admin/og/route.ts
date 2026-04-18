import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

async function requireAuth() {
  const token = (await cookies()).get('session_token')?.value
  if (!token) return null
  return validateSession(token)
}

export async function GET(req: NextRequest) {
  if (!await requireAuth()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CreahubBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    const html = await res.text()

    const get = (prop: string) => {
      const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
              || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'))
      return m?.[1] || null
    }

    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || null

    return NextResponse.json({
      title: get('og:title') || titleTag,
      description: get('og:description') || get('description'),
      image: get('og:image'),
      url,
    })
  } catch {
    return NextResponse.json({ title: null, description: null, image: null, url })
  }
}
