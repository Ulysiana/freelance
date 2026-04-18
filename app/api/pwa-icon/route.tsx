import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const DEFAULT_SIZE = 512

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedSize = Number(searchParams.get('size') || DEFAULT_SIZE)
  const size = requestedSize === 192 ? 192 : 512
  const brandSize = Math.round(size * 0.34)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at top, #2d2018 0%, #120d0a 60%, #0a0806 100%)',
          color: '#f0ebe4',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: size - Math.round(size * 0.18),
            height: size - Math.round(size * 0.18),
            borderRadius: Math.round(size * 0.24),
            border: '2px solid rgba(232,148,106,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 80px rgba(232,148,106,0.18) inset',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: brandSize,
              height: brandSize,
              borderRadius: Math.round(size * 0.12),
              background: 'linear-gradient(135deg, #e8946a, #c27b5b)',
              color: '#1a1714',
              fontSize: Math.round(size * 0.26),
              fontWeight: 800,
            }}
          >
            C
          </div>
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}
