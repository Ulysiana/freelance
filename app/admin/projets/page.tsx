'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, User, Euro, ChevronRight, Circle, Zap, Archive } from 'lucide-react'

type Project = {
  id: string; name: string; description: string | null; status: string; tjm: number
  client: { id: string; name: string | null; pseudo: string | null; email: string }
  collaborators: { collaborator: { id: string; name: string | null; pseudo: string | null } }[]
}

const statusLabel: Record<string, string> = { DRAFT: 'Brouillon', ACTIVE: 'Actif', ARCHIVED: 'Archivé' }
const statusColor: Record<string, string> = { DRAFT: 'rgba(240,235,228,0.4)', ACTIVE: '#86efac', ARCHIVED: 'rgba(240,235,228,0.2)' }
const statusIcon: Record<string, React.ElementType> = { DRAFT: Circle, ACTIVE: Zap, ARCHIVED: Archive }

export default function ProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/projects').then(r => r.json()).then(d => { setProjects(d.projects || []); setLoading(false) })
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Projets</h1>
        <Link href="/admin/projets/nouveau" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
          <Plus size={14} strokeWidth={2.5} /> Nouveau projet
        </Link>
      </div>

      {loading ? <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.length === 0 && <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Aucun projet pour l'instant.</p>}
          {projects.map(p => (
            <Link key={p.id} href={`/admin/projets/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,148,106,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} strokeWidth={1.8} />{p.client.pseudo || p.client.name || p.client.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Euro size={11} strokeWidth={1.8} />{p.tjm}/j</span>
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
