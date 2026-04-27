'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Link2, X, Plus } from 'lucide-react'

type Phase = { id: string; name: string; tasks: { id: string; title: string }[] }
type Request = {
  id: string; title: string; description: string | null; status: string; createdAt: string
  author: { id: string; name: string | null; pseudo: string | null; role: string }
  phase: { id: string; name: string } | null
  task:  { id: string; title: string } | null
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'En attente', color: '#fbbf24' },
  ACCEPTED: { label: 'Acceptée',   color: '#86efac' },
  REFUSED:  { label: 'Refusée',    color: 'rgba(248,113,113,0.7)' },
  QUOTED:   { label: 'Hors devis', color: '#e8946a' },
}

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6, padding: '5px 8px', color: '#f0ebe4', fontSize: 12,
  outline: 'none', cursor: 'pointer',
}

export default function DemandesPage() {
  const { id } = useParams<{ id: string }>()
  const [requests, setRequests] = useState<Request[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [selections, setSelections] = useState<Record<string, { phaseId: string; taskId: string }>>({})
  const [newTaskFor, setNewTaskFor] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  async function load() {
    const [reqData, phaseData] = await Promise.all([
      fetch(`/api/admin/projects/${id}/requests`).then(r => r.json()),
      fetch(`/api/admin/phases?projectId=${id}`).then(r => r.json()),
    ])
    const reqs: Request[] = reqData.requests || []
    setRequests(reqs)
    setPhases(phaseData.phases || [])
    const initial: Record<string, { phaseId: string; taskId: string }> = {}
    reqs.forEach(r => { initial[r.id] = { phaseId: r.phase?.id || '', taskId: r.task?.id || '' } })
    setSelections(initial)
  }

  useEffect(() => { load() }, [id])

  async function updateStatus(requestId: string, status: string) {
    setRequests(r => r.map(x => x.id === requestId ? { ...x, status } : x))
    await fetch(`/api/admin/requests/${requestId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async function linkRequest(requestId: string) {
    const sel = selections[requestId] || { phaseId: '', taskId: '' }
    const res = await fetch(`/api/admin/requests/${requestId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phaseId: sel.phaseId || null, taskId: sel.taskId || null }),
    })
    const data = await res.json()
    setRequests(r => r.map(x => x.id === requestId ? { ...x, phase: data.request.phase, task: data.request.task } : x))
  }

  async function unlink(requestId: string) {
    setSelections(s => ({ ...s, [requestId]: { phaseId: '', taskId: '' } }))
    const res = await fetch(`/api/admin/requests/${requestId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phaseId: null, taskId: null }),
    })
    const data = await res.json()
    setRequests(r => r.map(x => x.id === requestId ? { ...x, phase: data.request.phase, task: data.request.task } : x))
  }

  async function createTaskAndLink(requestId: string) {
    const sel = selections[requestId]
    if (!sel?.phaseId || !newTaskTitle.trim()) return
    const res = await fetch(`/api/admin/phases/${sel.phaseId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle.trim() }),
    })
    const data = await res.json()
    const taskId = data.task?.id
    if (!taskId) return
    setSelections(s => ({ ...s, [requestId]: { ...s[requestId], taskId } }))
    setPhases(ph => ph.map(p => p.id === sel.phaseId ? { ...p, tasks: [...p.tasks, { id: taskId, title: newTaskTitle.trim() }] } : p))
    const patchRes = await fetch(`/api/admin/requests/${requestId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phaseId: sel.phaseId, taskId }),
    })
    const patchData = await patchRes.json()
    setRequests(r => r.map(x => x.id === requestId ? { ...x, phase: patchData.request.phase, task: patchData.request.task } : x))
    setNewTaskFor(null)
    setNewTaskTitle('')
  }

  async function del(requestId: string) {
    if (!confirm('Supprimer cette demande ?')) return
    setRequests(r => r.filter(x => x.id !== requestId))
    await fetch(`/api/admin/requests/${requestId}`, { method: 'DELETE' })
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Demandes</h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
          Demandes envoyées par le client. Change le statut et rattache à une phase ou tâche.
        </p>
      </div>

      {requests.length === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucune demande pour ce projet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.map(r => {
            const sel = selections[r.id] || { phaseId: '', taskId: '' }
            const selectedPhase = phases.find(p => p.id === sel.phaseId)
            const isLinked = !!(r.phase || r.task)

            return (
              <div key={r.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Titre + statut + actions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{r.title}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: `${statusConfig[r.status]?.color}18`, color: statusConfig[r.status]?.color, border: `1px solid ${statusConfig[r.status]?.color}44` }}>
                        {statusConfig[r.status]?.label}
                      </span>
                    </div>
                    {r.description && <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.55)', margin: '0 0 4px', lineHeight: 1.5 }}>{r.description}</p>}
                    <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>
                      {r.author.pseudo || r.author.name} · {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                    {Object.entries(statusConfig).map(([val, cfg]) => (
                      <button key={val} onClick={() => updateStatus(r.id, val)}
                        style={{ padding: '3px 10px', borderRadius: 999, border: `1px solid ${cfg.color}44`, background: r.status === val ? `${cfg.color}18` : 'transparent', color: r.status === val ? cfg.color : 'rgba(240,235,228,0.3)', cursor: 'pointer', fontSize: 11 }}>
                        {cfg.label}
                      </button>
                    ))}
                    <button onClick={() => del(r.id)} style={{ padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(248,113,113,0.2)', background: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', fontSize: 11 }}>×</button>
                  </div>
                </div>

                {/* Rattachement */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                  {isLinked ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Link2 size={12} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#7dd3fc' }}>
                        {r.phase?.name}{r.task ? ` · ${r.task.title}` : ''}
                      </span>
                      <button onClick={() => unlink(r.id)} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <X size={13} strokeWidth={1.8} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Link2 size={12} strokeWidth={1.8} style={{ color: 'rgba(240,235,228,0.25)', flexShrink: 0 }} />
                      <select value={sel.phaseId} onChange={e => setSelections(s => ({ ...s, [r.id]: { phaseId: e.target.value, taskId: '' } }))} style={selectStyle}>
                        <option value="" style={{ color: '#111', background: '#fff' }}>— Phase —</option>
                        {phases.map(p => <option key={p.id} value={p.id} style={{ color: '#111', background: '#fff' }}>{p.name}</option>)}
                      </select>
                      {sel.phaseId && (
                        <>
                          <select value={sel.taskId} onChange={e => setSelections(s => ({ ...s, [r.id]: { ...s[r.id], taskId: e.target.value } }))} style={selectStyle}>
                            <option value="" style={{ color: '#111', background: '#fff' }}>— Tâche (optionnel) —</option>
                            {selectedPhase?.tasks.map(t => <option key={t.id} value={t.id} style={{ color: '#111', background: '#fff' }}>{t.title}</option>)}
                          </select>
                          {newTaskFor === r.id ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input
                                autoFocus
                                placeholder="Nom de la tâche"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && createTaskAndLink(r.id)}
                                style={{ ...selectStyle, width: 160 }}
                              />
                              <button onClick={() => createTaskAndLink(r.id)} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: 'rgba(125,211,252,0.15)', color: '#7dd3fc', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>OK</button>
                              <button onClick={() => { setNewTaskFor(null); setNewTaskTitle('') }} style={{ padding: '4px 6px', borderRadius: 6, border: 'none', background: 'none', color: 'rgba(240,235,228,0.3)', cursor: 'pointer', fontSize: 11 }}>×</button>
                            </div>
                          ) : (
                            <button onClick={() => setNewTaskFor(r.id)} title="Créer une nouvelle tâche"
                              style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Plus size={12} strokeWidth={2} />
                            </button>
                          )}
                        </>
                      )}
                      {sel.phaseId && (
                        <button onClick={() => linkRequest(r.id)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(125,211,252,0.12)', color: '#7dd3fc', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                          Lier
                        </button>
                      )}
                    </div>
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
