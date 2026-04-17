'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderOpen, CalendarDays, ChevronRight, Circle, Zap, Archive } from 'lucide-react'

type Project = {
  id: string; name: string; description: string | null; status: string; tjm: number; createdAt: string
  collaborators: { collaborator: { id: string; name: string | null; pseudo: string | null } }[]
}

const statusLabel: Record<string, string> = { DRAFT: 'En préparation', ACTIVE: 'En cours', ARCHIVED: 'Terminé' }
const statusColor: Record<string, string> = { DRAFT: 'rgba(240,235,228,0.4)', ACTIVE: '#86efac', ARCHIVED: 'rgba(240,235,228,0.2)' }
const statusIcon: Record<string, React.ElementType> = { DRAFT: Circle, ACTIVE: Zap, ARCHIVED: Archive }

export default function ClientProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/projects').then(r => r.json()).then(d => { setProjects(d.projects || []); setLoading(false) })
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <FolderOpen size={20} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Mes projets</h1>
      </div>
      {loading ? <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {projects.length === 0 && <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Aucun projet pour le moment.</p>}
          {projects.map(p => (
            <Link key={p.id} href={`/client/projets/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 28px', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,148,106,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.5)', lineHeight: 1.6, marginBottom: 10 }}>{p.description}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(240,235,228,0.3)' }}>
                    <CalendarDays size={11} strokeWidth={1.8} />
                    Démarré le {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16 }}>
                  {(() => { const Icon = statusIcon[p.status]; return (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${statusColor[p.status]}44`, color: statusColor[p.status], whiteSpace: 'nowrap' }}>
                      <Icon size={10} strokeWidth={2} />{statusLabel[p.status]}
                    </span>
                  )})()}
                  <ChevronRight size={16} strokeWidth={1.8} style={{ color: 'rgba(240,235,228,0.25)' }} />
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
