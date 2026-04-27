'use client'

import { useState } from 'react'
import Link from 'next/link'

type Task = { id: string; title: string; status: string; description: string | null }
type Phase = { id: string; name: string; order: number; tasks: Task[] }

const statusLabel: Record<string, string> = { TODO: 'À faire', IN_PROGRESS: 'En cours', DONE: 'Fait', VALIDATED: 'Validé' }
const statusColor: Record<string, string> = { TODO: 'rgba(240,235,228,0.35)', IN_PROGRESS: '#fbbf24', DONE: '#86efac', VALIDATED: '#e8946a' }

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 10px', color: '#f0ebe4', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }

export default function PhaseBoard({ phases: initial, projectId, isAdmin, taskBasePath }: {
  phases: Phase[]; projectId: string; isAdmin: boolean; taskBasePath: string
}) {
  const [phases, setPhases] = useState<Phase[]>(initial)
  const [newPhaseName, setNewPhaseName] = useState('')
  const [newTaskTitles, setNewTaskTitles] = useState<Record<string, string>>({})

  async function reload() {
    const res = await fetch(`/api/admin/phases?projectId=${projectId}`)
    const data = await res.json()
    setPhases(data.phases || [])
  }

  async function addPhase() {
    if (!newPhaseName.trim()) return
    await fetch('/api/admin/phases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, name: newPhaseName, order: phases.length }) })
    setNewPhaseName('')
    reload()
  }

  async function deletePhase(id: string) {
    if (!confirm('Supprimer cette phase et toutes ses tâches ?')) return
    const res = await fetch(`/api/admin/phases/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Suppression impossible')
      return
    }
    reload()
  }

  async function addTask(phaseId: string) {
    const title = newTaskTitles[phaseId]?.trim()
    if (!title) return
    await fetch(`/api/admin/phases/${phaseId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
    setNewTaskTitles(t => ({ ...t, [phaseId]: '' }))
    reload()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {phases.map(phase => {
        const allValidated = phase.tasks.length > 0 && phase.tasks.every(task => task.status === 'VALIDATED')
        return (
        <div key={phase.id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{phase.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>{phase.tasks.length} tâche{phase.tasks.length !== 1 ? 's' : ''}</span>
              {allValidated && (
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(134,239,172,0.12)', border: '1px solid rgba(134,239,172,0.22)', color: '#86efac' }}>
                  Phase validée
                </span>
              )}
              {isAdmin && !allValidated && <button onClick={() => deletePhase(phase.id)} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {phase.tasks.map(task => (
              <Link key={task.id} href={`${taskBasePath}/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{ fontSize: 14 }}>{task.title}</span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${statusColor[task.status]}44`, color: statusColor[task.status], whiteSpace: 'nowrap' }}>
                    {statusLabel[task.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {isAdmin && (
            <div style={{ padding: '10px 16px', borderTop: phase.tasks.length > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', gap: 8 }}>
              <input style={inputStyle} placeholder="+ Ajouter une tâche" value={newTaskTitles[phase.id] || ''}
                onChange={e => setNewTaskTitles(t => ({ ...t, [phase.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addTask(phase.id)} />
              <button onClick={() => addTask(phase.id)} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: 'rgba(232,148,106,0.15)', color: '#e8946a', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>Ajouter</button>
            </div>
          )}
        </div>
      )})}

      {isAdmin && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={inputStyle} placeholder="Nom de la nouvelle phase" value={newPhaseName} onChange={e => setNewPhaseName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPhase()} />
          <button onClick={addPhase} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'rgba(232,148,106,0.12)', color: '#e8946a', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>+ Phase</button>
        </div>
      )}
    </div>
  )
}
