'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Users, LogOut, ShieldCheck, UserPlus, Settings, Menu, X } from 'lucide-react'
import { useIsMobile } from '@/lib/useIsMobile'

type User = { id: string; name: string | null; email: string; role: string }

const navItems = [
  { href: '/bureau', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/bureau/projets', label: 'Projets', icon: FolderKanban },
  { href: '/bureau/users', label: 'Utilisateurs', icon: Users },
  { href: '/bureau/invitations', label: 'Invitations', icon: UserPlus },
  { href: '/bureau/securite', label: 'Sécurité', icon: ShieldCheck },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user || data.user.role === 'CLIENT') router.push('/login')
      else setUser(data.user)
    })
  }, [router])

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  const NavContent = () => (
    <>
      <div style={{ marginBottom: 28, paddingLeft: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Admin</span></span>
        {isMobile && (
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', padding: 4 }}>
            <X size={18} strokeWidth={1.8} />
          </button>
        )}
      </div>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/bureau' && pathname.startsWith(href))
        return (
          <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: active ? '#e8946a' : 'rgba(240,235,228,0.6)', textDecoration: 'none', fontSize: 13, background: active ? 'rgba(232,148,106,0.08)' : 'transparent', transition: 'all 0.15s' }}>
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </a>
        )
      })}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.3)', padding: '8px 12px', marginBottom: 4 }}>{user.name || user.email}</div>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 13 }}>
          <LogOut size={14} strokeWidth={1.8} />
          Se déconnecter
        </button>
      </div>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', color: '#f0ebe4', display: 'flex' }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={{ width: 220, flexShrink: 0, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 0, height: '100vh' }}>
          <NavContent />
        </aside>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#0a0806', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Admin</span></span>
          <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#f0ebe4', cursor: 'pointer', padding: 6 }}>
            <Menu size={20} strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* Mobile drawer overlay */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
          <aside style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 240, background: '#111009', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <NavContent />
          </aside>
        </div>
      )}

      <main style={{ flex: 1, padding: isMobile ? '72px 16px 32px' : 40, minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
