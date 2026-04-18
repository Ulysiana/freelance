import { NextRequest, NextResponse } from 'next/server'

type RateLimitOptions = {
  key: string
  windowMs: number
  max: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const globalRateLimitStore = globalThis as typeof globalThis & {
  __creahubRateLimitStore__?: Map<string, RateLimitEntry>
}

function getRateLimitStore() {
  if (!globalRateLimitStore.__creahubRateLimitStore__) {
    globalRateLimitStore.__creahubRateLimitStore__ = new Map<string, RateLimitEntry>()
  }

  return globalRateLimitStore.__creahubRateLimitStore__
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

export function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function rateLimit(request: NextRequest, options: RateLimitOptions) {
  const store = getRateLimitStore()
  const now = Date.now()
  const ip = getClientIp(request)
  const storeKey = `${options.key}:${ip}`
  const current = store.get(storeKey)

  if (!current || current.resetAt <= now) {
    store.set(storeKey, { count: 1, resetAt: now + options.windowMs })
    return null
  }

  if (current.count >= options.max) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000))

    return NextResponse.json(
      { error: 'Trop de tentatives, réessaie plus tard.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      },
    )
  }

  current.count += 1
  store.set(storeKey, current)
  return null
}
