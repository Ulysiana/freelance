'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Kanban, Clock, MessageCirclePlus, FileText, Globe, MessageSquare } from 'lucide-react'

type Project = {
  id: string; name: string; description: string | null; status: string; tjm: number; createdAt: string
  client: { id: string; name: string | null; pseudo: string | null; email: string }
  collaborators: { collaborator: { id: string; name: string | null; pseudo: string | null } }[]
}

const statusLabel: Record<string, string> = { DRAFT: 'Brouillon', ACTIVE: 'Actif', ARCHIVED: 'Archivé' }
const statusColor: Record<string, string> = { DRAFT: 'rgba(240,235,228,0.4)', ACTIVE: '#86efac', ARCHIVED: 'rgba(240,235,228,0.2)' }

export default function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', tjm: '', status: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/projects/${id}`).then(r => r.json()).then(d => {
      setProject(d.project)
      setForm({ name: d.project.name, description: d.project.description || '', tjm: String(d.project.tjm), status: d.project.status })
      setLoading(false)
    })
  }, [id])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setProject(data.project)
    setEditing(false)
    setSaving(false)
  }

  async function handleArchive() {
    if (!confirm('Archiver ce projet ?')) return
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    router.push('/admin/projets')
  }

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#f0ebe4', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }

  if (loading) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
  if (!project) return <p style={{ color: '#f87171' }}>Projet introuvable.</p>

  const displayName = (u: { name: string | null; pseudo: string | null; email?: string }) => u.pseudo || u.name || u.email || '—'

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => router.push('/admin/projets')} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
        {editing ? (
          <input style={{ ...inputStyle, fontSize: 22, fontWeight: 700, flex: 1 }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        ) : (
          <h1 style={{ fontSize: 24, fontWeight: 700, flex: 1 }}>{project.name}</h1>
        )}
        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${statusColor[project.status]}44`, color: statusColor[project.status] }}>
          {statusLabel[project.status]}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Client</div>
          <div style={{ fontWeight: 600 }}>{displayName(project.client)}</div>
          <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', marginTop: 2 }}>{project.client.email}</div>
        </div>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>TJM</div>
          {editing ? (
            <input style={{ ...inputStyle, fontSize: 20, fontWeight: 700 }} type="number" value={form.tjm} onChange={e => setForm(f => ({ ...f, tjm: e.target.value }))} />
          ) : (
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e8946a' }}>{project.tjm} €<span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(240,235,228,0.4)' }}>/jour</span></div>
          )}
        </div>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Description</div>
        {editing ? (
          <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        ) : (
          <p style={{ fontSize: 14, color: 'rgba(240,235,228,0.6)', lineHeight: 1.7 }}>{project.description || <em style={{ opacity: 0.4 }}>Aucune description</em>}</p>
        )}
      </div>

      {editing && (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Statut</div>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v} style={{ background: '#111' }}>{l}</option>)}
          </select>
        </div>
      )}

      {project.collaborators.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Collaborateurs</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {project.collaborators.map(({ collaborator: c }) => (
              <span key={c.id} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(125,211,252,0.08)', border: '1px solid rgba(125,211,252,0.2)', color: '#7dd3fc' }}>{displayName(c)}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { href: `/admin/projets/${id}/taches`,  label: 'Phases & Tâches', icon: Kanban },
          { href: `/admin/projets/${id}/temps`,   label: 'Suivi du temps',  icon: Clock },
          { href: `/admin/projets/${id}/demandes`,  label: 'Demandes',        icon: MessageCirclePlus },
          { href: `/admin/projets/${id}/documents`, label: 'Documents',       icon: FileText },
          { href: `/admin/projets/${id}/pages`,     label: 'Pages HTML',      icon: Globe },
          { href: `/admin/projets/${id}/messages`, label: 'Messages',        icon: MessageSquare },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.7)', textDecoration: 'none', fontSize: 13, transition: 'border-color 0.15s' }}>
            <Icon size={14} strokeWidth={1.8} />
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {editing ? (
          <>
            <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.6)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.7)', cursor: 'pointer', fontSize: 13 }}>Modifier</button>
            {project.status !== 'ARCHIVED' && (
              <button onClick={handleArchive} style={{ padding: '10px 20px', borderRadius: 8, background: 'none', border: '1px solid rgba(220,50,50,0.25)', color: 'rgba(248,113,113,0.7)', cursor: 'pointer', fontSize: 13 }}>Archiver</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
