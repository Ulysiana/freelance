'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ExternalLink, X } from 'lucide-react'

type PhaseLink = { id: string; url: string; title: string | null; addedBy: { name: string | null; pseudo: string | null } }
type TaskLink  = { id: string; url: string; title: string | null; addedBy: { name: string | null; pseudo: string | null } }
type Task      = { id: string; title: string; links: TaskLink[] }
type Phase     = { id: string; name: string; phaseLinks: PhaseLink[]; tasks: Task[] }

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 7, padding: '7px 11px', color: '#f0ebe4', fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
}

export default function LiensPage() {
  const { id } = useParams<{ id: string }>()
  const [phases, setPhases] = useState<Phase[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [phaseId, setPhaseId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [adding, setAdding] = useState(false)

  async function load() {
    const res = await fetch(`/api/admin/projects/${id}/liens`)
    const data = await res.json()
    setPhases(data.phases || [])
  }

  useEffect(() => { load() }, [id])

  const selectedPhase = phases.find(p => p.id === phaseId)

  async function addLink() {
    if (!url.trim() || !phaseId) return
    setAdding(true)
    if (taskId) {
      await fetch(`/api/admin/tasks/${taskId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim() || null }),
      })
    } else {
      await fetch(`/api/admin/phases/${phaseId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim() || null }),
      })
    }
    setUrl('')
    setTitle('')
    setTaskId('')
    setAdding(false)
    load()
  }

  async function deletePhaseLink(linkId: string) {
    await fetch(`/api/admin/phase-links/${linkId}`, { method: 'DELETE' })
    setPhases(ps => ps.map(p => ({ ...p, phaseLinks: p.phaseLinks.filter(l => l.id !== linkId) })))
  }

  async function deleteTaskLink(linkId: string, taskId: string) {
    await fetch(`/api/admin/task-links/${linkId}`, { method: 'DELETE' })
    setPhases(ps => ps.map(p => ({
      ...p,
      tasks: p.tasks.map(t => t.id === taskId ? { ...t, links: t.links.filter(l => l.id !== linkId) } : t),
    })))
  }

  const totalLinks = phases.reduce((acc, p) => acc + p.phaseLinks.length + p.tasks.reduce((a, t) => a + t.links.length, 0), 0)

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Liens & ressources</h2>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
          Associe des URLs à une phase ou une tâche. Elles apparaîtront directement dans la tâche concernée.
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            style={{ ...inputStyle, flex: 2, minWidth: 180 }}
            placeholder="https://…"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLink()}
          />
          <input
            style={{ ...inputStyle, flex: 1, minWidth: 120 }}
            placeholder="Titre (optionnel)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLink()}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={phaseId} onChange={e => { setPhaseId(e.target.value); setTaskId('') }}
            style={{ ...inputStyle, cursor: 'pointer', flex: 1, minWidth: 140 }}>
            <option value="" style={{ color: '#111', background: '#fff' }}>— Phase —</option>
            {phases.map(p => <option key={p.id} value={p.id} style={{ color: '#111', background: '#fff' }}>{p.name}</option>)}
          </select>
          {phaseId && (
            <select value={taskId} onChange={e => setTaskId(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', flex: 1, minWidth: 140 }}>
              <option value="" style={{ color: '#111', background: '#fff' }}>— Tâche (optionnel) —</option>
              {selectedPhase?.tasks.map(t => <option key={t.id} value={t.id} style={{ color: '#111', background: '#fff' }}>{t.title}</option>)}
            </select>
          )}
          <button onClick={addLink} disabled={adding || !url.trim() || !phaseId}
            style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: url.trim() && phaseId ? 'linear-gradient(135deg, #e8946a, #c27b5b)' : 'rgba(255,255,255,0.06)', color: url.trim() && phaseId ? '#fff' : 'rgba(240,235,228,0.3)', fontWeight: 700, cursor: url.trim() && phaseId ? 'pointer' : 'not-allowed', fontSize: 13, flexShrink: 0 }}>
            {adding ? '…' : 'Ajouter'}
          </button>
        </div>
      </div>

      {/* Liste par phase */}
      {phases.length === 0 || totalLinks === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucun lien pour ce projet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {phases.map(phase => {
            const hasLinks = phase.phaseLinks.length > 0 || phase.tasks.some(t => t.links.length > 0)
            if (!hasLinks) return null
            return (
              <div key={phase.id}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  {phase.name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Liens de phase */}
                  {phase.phaseLinks.map(link => (
                    <LinkRow key={link.id} link={link} label={null} onDelete={() => deletePhaseLink(link.id)} />
                  ))}
                  {/* Liens de tâches */}
                  {phase.tasks.map(task =>
                    task.links.map(link => (
                      <LinkRow key={link.id} link={link} label={task.title} onDelete={() => deleteTaskLink(link.id, task.id)} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function LinkRow({ link, label, onDelete }: { link: { url: string; title: string | null }; label: string | null; onDelete: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
      <ExternalLink size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
      <a href={link.url} target="_blank" rel="noopener noreferrer"
        style={{ flex: 1, fontSize: 13, color: '#7dd3fc', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {link.title || link.url}
      </a>
      {link.title && (
        <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.22)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{link.url}</span>
      )}
      {label && (
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {label}
        </span>
      )}
      <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 2, flexShrink: 0, display: 'flex' }}>
        <X size={14} strokeWidth={1.8} />
      </button>
    </div>
  )
}
