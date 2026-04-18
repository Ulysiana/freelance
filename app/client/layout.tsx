'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FolderKanban, UserCircle, LogOut } from 'lucide-react'
import { useIsMobile } from '@/lib/useIsMobile'

type User = { id: string; name: string | null; email: string; role: string; totpEnabled: boolean }

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/login'); return }
      const onSetupPage = window.location.pathname === '/client/securite'
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
    { href: '/client', label: 'Accueil', icon: LayoutDashboard },
    { href: '/client/projets', label: 'Projets', icon: FolderKanban },
    { href: '/client/compte', label: 'Compte', icon: UserCircle },
  ]

  const isActive = (href: string) => href === '/client' ? pathname === '/client' : pathname.startsWith(href)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', color: '#f0ebe4' }}>
      {/* Desktop header */}
      {!isMobile && (
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 6, fontSize: 13, textDecoration: 'none', fontWeight: isActive(href) ? 600 : 400, color: isActive(href) ? '#e8946a' : 'rgba(240,235,228,0.5)', background: isActive(href) ? 'rgba(232,148,106,0.1)' : 'transparent' }}>
                  <Icon size={14} strokeWidth={1.8} /> {label}
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
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#0a0806', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', padding: 6 }}>
            <LogOut size={18} strokeWidth={1.8} />
          </button>
        </div>
      )}

      <main style={{ padding: isMobile ? '68px 16px 80px' : '32px 40px', minWidth: 0 }}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: '#0e0b08', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center' }}>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 8px 14px', textDecoration: 'none', color: isActive(href) ? '#e8946a' : 'rgba(240,235,228,0.4)' }}>
              <Icon size={20} strokeWidth={isActive(href) ? 2 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: isActive(href) ? 600 : 400 }}>{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
