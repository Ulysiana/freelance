'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Request = {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  author: { id: string; name: string | null; pseudo: string | null; role: string }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'En attente', color: '#fbbf24' },
  ACCEPTED: { label: 'Acceptée',   color: '#86efac' },
  REFUSED:  { label: 'Refusée',    color: 'rgba(248,113,113,0.7)' },
  QUOTED:   { label: 'Hors devis — nouveau devis à établir', color: '#e8946a' },
}

export default function ClientDemandesPage() {
  const { id } = useParams<{ id: string }>()
  const [requests, setRequests] = useState<Request[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    const res = await fetch(`/api/admin/projects/${id}/requests`)
    const data = await res.json()
    setRequests(data.requests || [])
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

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Mes demandes</h2>
          <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)', margin: '4px 0 0' }}>
            Demandez une modification, une évolution ou posez une question.
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
          + Nouvelle demande
        </button>
      </div>

      {showForm && (
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', margin: 0 }}>
            Décrivez votre demande. Si elle est hors du périmètre du projet, elle fera l'objet d'un nouveau devis.
          </p>
          <input placeholder="Titre de la demande *" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          <textarea placeholder="Description (optionnel)" value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submit} disabled={sending || !title.trim()} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 14px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucune demande pour l'instant.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {requests.map(r => {
            const cfg = statusConfig[r.status]
            return (
              <div key={r.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${cfg.color}22` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{r.title}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
                        {cfg.label}
                      </span>
                    </div>
                    {r.description && <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.55)', margin: '4px 0 6px', lineHeight: 1.5 }}>{r.description}</p>}
                    <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>
                      {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
