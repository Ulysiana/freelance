'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Request = {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  author: { id: string; name: string | null; pseudo: string | null; role: string }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'En attente',   color: '#fbbf24' },
  ACCEPTED: { label: 'Acceptée',     color: '#86efac' },
  REFUSED:  { label: 'Refusée',      color: 'rgba(248,113,113,0.7)' },
  QUOTED:   { label: 'Hors devis',   color: '#e8946a' },
}

export default function DemandesPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [projectName, setProjectName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    const [projRes, reqRes] = await Promise.all([
      fetch(`/api/admin/projects/${id}`),
      fetch(`/api/admin/projects/${id}/requests`),
    ])
    const projData = await projRes.json()
    const reqData = await reqRes.json()
    setProjectName(projData.project?.name || '')
    setRequests(reqData.requests || [])
  }

  useEffect(() => { load() }, [id])

  async function submit() {
    if (!title.trim()) return
    setSending(true)
    await fetch(`/api/admin/projects/${id}/requests`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    setTitle('')
    setDescription('')
    setShowForm(false)
    setSending(false)
    load()
  }

  async function updateStatus(requestId: string, status: string) {
    setRequests(r => r.map(x => x.id === requestId ? { ...x, status } : x))
    await fetch(`/api/admin/requests/${requestId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async function del(requestId: string) {
    if (!confirm('Supprimer cette demande ?')) return
    setRequests(r => r.filter(x => x.id !== requestId))
    await fetch(`/api/admin/requests/${requestId}`, { method: 'DELETE' })
  }

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push(`/admin/projets/${id}`)} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Demandes</h1>
          <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>{projectName}</span>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
          + Nouvelle demande
        </button>
      </div>

      {showForm && (
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Titre de la demande *" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          <textarea placeholder="Description (optionnel)" value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submit} disabled={sending || !title.trim()} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {sending ? 'Envoi...' : 'Envoyer la demande'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 14px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucune demande pour ce projet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {requests.map(r => (
            <div key={r.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{r.title}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: `${statusConfig[r.status]?.color}18`, color: statusConfig[r.status]?.color, border: `1px solid ${statusConfig[r.status]?.color}44` }}>
                      {statusConfig[r.status]?.label}
                    </span>
                  </div>
                  {r.description && <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.55)', margin: '4px 0 8px', lineHeight: 1.5 }}>{r.description}</p>}
                  <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>
                    {r.author.pseudo || r.author.name} · {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {Object.entries(statusConfig).map(([val, cfg]) => (
                    <button key={val} onClick={() => updateStatus(r.id, val)}
                      style={{ padding: '3px 10px', borderRadius: 999, border: `1px solid ${cfg.color}44`, background: r.status === val ? `${cfg.color}18` : 'transparent', color: r.status === val ? cfg.color : 'rgba(240,235,228,0.3)', cursor: 'pointer', fontSize: 11 }}>
                      {cfg.label}
                    </button>
                  ))}
                  <button onClick={() => del(r.id)} style={{ padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(248,113,113,0.2)', background: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', fontSize: 11 }}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
