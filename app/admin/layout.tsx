'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Users, LogOut } from 'lucide-react'

type User = { id: string; name: string | null; email: string; role: string }

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/projets', label: 'Projets', icon: FolderKanban },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user || data.user.role === 'CLIENT') router.push('/login')
      else setUser(data.user)
    })
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', color: '#f0ebe4', display: 'flex' }}>
      <aside style={{ width: 220, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ marginBottom: 28, paddingLeft: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Admin</span></span>
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: active ? '#e8946a' : 'rgba(240,235,228,0.6)', textDecoration: 'none', fontSize: 13, background: active ? 'rgba(232,148,106,0.08)' : 'transparent', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
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
      </aside>
      <main style={{ flex: 1, padding: 40 }}>{children}</main>
    </div>
  )
}
