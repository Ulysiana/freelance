'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, LayoutGrid, MessageSquare, FileText, AlertCircle } from 'lucide-react'

function getActiveTab(pathname: string, id: string) {
  if (pathname.startsWith(`/client/projets/${id}/messages`)) return 'messages'
  if (pathname.startsWith(`/client/projets/${id}/documents`)) return 'documents'
  if (pathname.startsWith(`/client/projets/${id}/demandes`)) return 'demandes'
  return 'suivi'
}

export default function ClientProjetLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const [projectName, setProjectName] = useState('')
  const active = getActiveTab(pathname, id)
  const isTaskDetail = pathname.includes('/taches/')

  useEffect(() => {
    fetch('/api/client/projects').then(r => r.json()).then(d => {
      const project = (d.projects || []).find((p: { id: string }) => p.id === id)
      setProjectName(project?.name || '')
    })
  }, [id])

  const tabList = [
    { key: 'suivi',     label: 'Suivi',     Icon: LayoutGrid,    href: `/client/projets/${id}` },
    { key: 'messages',  label: 'Messages',  Icon: MessageSquare, href: `/client/projets/${id}/messages` },
    { key: 'documents', label: 'Documents', Icon: FileText,       href: `/client/projets/${id}/documents` },
    { key: 'demandes',  label: 'Demandes',  Icon: AlertCircle,   href: `/client/projets/${id}/demandes` },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        <Link href="/client/projets" style={{ color: 'inherit', textDecoration: 'none' }}>Mes projets</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        {isTaskDetail ? (
          <Link href={`/client/projets/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{projectName || '…'}</Link>
        ) : (
          <span style={{ color: '#f0ebe4' }}>{projectName || '…'}</span>
        )}
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>{projectName || ' '}</h1>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28, overflowX: 'auto' }}>
        {tabList.map(({ key, label, Icon, href }) => {
          const isActive = active === key
          return (
            <Link key={key} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px',
              borderBottom: `2px solid ${isActive ? '#e8946a' : 'transparent'}`,
              marginBottom: -1,
              color: isActive ? '#e8946a' : 'rgba(240,235,228,0.45)',
              fontWeight: isActive ? 600 : 400,
              fontSize: 13,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'color 0.15s',
            }}>
              <Icon size={13} strokeWidth={1.8} />
              {label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
