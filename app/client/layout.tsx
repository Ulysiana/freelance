'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FolderKanban, UserCircle } from 'lucide-react'

type User = { id: string; name: string | null; email: string; role: string; totpEnabled: boolean }

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return }
      const onSetupPage = pathname === '/client/securite'
      if (!data.user.totpEnabled && !onSetupPage) { router.push('/client/securite'); return }
      setUser(data.user)
    })
  }, [router, pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  const navLinks = [
    { href: '/client', label: 'Tableau de bord', icon: <LayoutDashboard size={15} strokeWidth={1.8} /> },
    { href: '/client/projets', label: 'Projets', icon: <FolderKanban size={15} strokeWidth={1.8} /> },
    { href: '/client/compte', label: 'Mon compte', icon: <UserCircle size={15} strokeWidth={1.8} /> },
  ]

  const navLinkStyle = (href: string) => {
    const active = href === '/client' ? pathname === '/client' : pathname.startsWith(href)
    return {
      display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 6,
      fontSize: 13, textDecoration: 'none', fontWeight: active ? 600 : 400,
      color: active ? '#e8946a' : 'rgba(240,235,228,0.5)',
      background: active ? 'rgba(232,148,106,0.1)' : 'transparent',
      transition: 'all 0.15s',
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', color: '#f0ebe4' }}>
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href} style={navLinkStyle(href)}>
                {icon} {label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>{user.name || user.email}</span>
          <button onClick={handleLogout} style={{ padding: '5px 12px', borderRadius: 999, background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12 }}>
            Déconnexion
          </button>
        </div>
      </header>
      <main style={{ padding: '32px 40px' }}>{children}</main>
    </div>
  )
}
