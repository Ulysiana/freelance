'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = { id: string; name: string | null; email: string; role: string }

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) router.push('/login')
      else setUser(data.user)
    })
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', color: '#f0ebe4' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>{user.name || user.email}</span>
          <button onClick={handleLogout} style={{ padding: '6px 14px', borderRadius: 999, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12 }}>
            Se déconnecter
          </button>
        </div>
      </header>
      <main style={{ padding: 40 }}>{children}</main>
    </div>
  )
}
