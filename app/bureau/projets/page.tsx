'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, User, ChevronRight, Circle, Zap, Archive } from 'lucide-react'
import { useIsMobile } from '@/lib/useIsMobile'
import { formatAmount } from '@/lib/currency'

type Project = {
  id: string; name: string; description: string | null; status: string; tjm: number
  client: { id: string; name: string | null; pseudo: string | null; email: string; billingCurrency: string | null }
  collaborators: { collaborator: { id: string; name: string | null; pseudo: string | null } }[]
}

const statusLabel: Record<string, string> = { DRAFT: 'Brouillon', ACTIVE: 'Actif', ARCHIVED: 'Archivé' }
const statusColor: Record<string, string> = { DRAFT: 'rgba(240,235,228,0.4)', ACTIVE: '#86efac', ARCHIVED: 'rgba(240,235,228,0.2)' }
const statusIcon: Record<string, React.ElementType> = { DRAFT: Circle, ACTIVE: Zap, ARCHIVED: Archive }

export default function ProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [defaultCurrency, setDefaultCurrency] = useState('EUR')
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/projects').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ]).then(([d, s]) => {
      setProjects(d.projects || [])
      setDefaultCurrency(s.currency || 'EUR')
      setLoading(false)
    })
  }, [])

  const filtered = showArchived ? projects : projects.filter(p => p.status !== 'ARCHIVED')
  const archivedCount = projects.filter(p => p.status === 'ARCHIVED').length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Projets</h1>
        <Link href="/bureau/projets/nouveau" style={{ display: 'inline-flex', alignItems: 'center', gap: isMobile ? 0 : 7, padding: isMobile ? '9px' : '9px 20px', borderRadius: isMobile ? 8 : 999, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
          <Plus size={16} strokeWidth={2.5} />{!isMobile && ' Nouveau projet'}
        </Link>
      </div>

      {!loading && archivedCount > 0 && (
        <button onClick={() => setShowArchived(v => !v)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: showArchived ? 'rgba(255,255,255,0.06)' : 'none', color: showArchived ? 'rgba(240,235,228,0.7)' : 'rgba(240,235,228,0.35)', cursor: 'pointer', fontSize: 12 }}>
          <Archive size={12} strokeWidth={1.8} />
          {showArchived ? 'Masquer les archivés' : `Voir les archivés (${archivedCount})`}
        </button>
      )}

      {loading ? <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 && <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Aucun projet pour l&apos;instant.</p>}
          {filtered.map(p => (
            <Link key={p.id} href={`/bureau/projets/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,148,106,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} strokeWidth={1.8} />{p.client.pseudo || p.client.name || p.client.email}</span>
                    <span>{formatAmount(p.tjm, p.client.billingCurrency || defaultCurrency, 0)}/j</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {(() => { const Icon = statusIcon[p.status]; return (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${statusColor[p.status]}44`, color: statusColor[p.status] }}>
                      <Icon size={10} strokeWidth={2} />{statusLabel[p.status]}
                    </span>
                  )})()}
                  <ChevronRight size={16} strokeWidth={1.8} style={{ color: 'rgba(240,235,228,0.25)' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
