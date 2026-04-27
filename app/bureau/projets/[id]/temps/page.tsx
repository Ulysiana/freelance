'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Clock } from 'lucide-react'
import { formatAmount } from '@/lib/currency'
import { formatDuration } from '@/lib/formatTime'

type TaskTime = {
  id: string
  title: string
  status: string
  totalSeconds: number
  cost: number
  phaseName: string
  openSessionId: string | null
  openStartedAt: string | null
  sessions: {
    id: string
    startedAt: string
    endedAt: string | null
    durationSeconds: number | null
    user: { id: string; name: string | null; pseudo: string | null }
  }[]
}

type ProjectData = {
  id: string
  name: string
  tjm: number
}

const statusColors: Record<string, string> = {
  TODO: 'rgba(240,235,228,0.35)',
  IN_PROGRESS: '#fbbf24',
  DONE: '#86efac',
  VALIDATED: '#e8946a',
}
const statusLabels: Record<string, string> = {
  TODO: 'À faire', IN_PROGRESS: 'En cours', DONE: 'Fait', VALIDATED: 'Validé',
}

export default function ProjectTimePage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectData | null>(null)
  const [tasks, setTasks] = useState<TaskTime[]>([])
  const [loading, setLoading] = useState(true)
  const [hoursPerDay, setHoursPerDay] = useState(8)
  const [currency, setCurrency] = useState('EUR')
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    const [projRes, timeRes, settRes] = await Promise.all([
      fetch(`/api/admin/projects/${id}`),
      fetch(`/api/admin/projects/${id}/temps`),
      fetch('/api/admin/settings'),
    ])
    const projData = await projRes.json()
    const timeData = await timeRes.json()
    const sett = await settRes.json()
    setProject(projData.project)
    setTasks(timeData.tasks || [])
    setCurrency(timeData.currency || 'EUR')
    setHoursPerDay(sett.hoursPerDay || 8)
    setLoading(false)
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/projects/${id}`),
      fetch(`/api/admin/projects/${id}/temps`),
      fetch('/api/admin/settings'),
    ]).then(async ([projRes, timeRes, settRes]) => {
      const projData = await projRes.json()
      const timeData = await timeRes.json()
      const sett = await settRes.json()
      setProject(projData.project)
      setTasks(timeData.tasks || [])
      setCurrency(timeData.currency || 'EUR')
      setHoursPerDay(sett.hoursPerDay || 8)
      setLoading(false)
    })
  }, [id])

  async function startTask(taskId: string) {
    setBusyTaskId(taskId)
    setError('')
    const res = await fetch(`/api/admin/tasks/${taskId}/sessions`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Démarrage impossible')
      setBusyTaskId(null)
      return
    }
    await load()
    setBusyTaskId(null)
  }

  async function stopTask(sessionId: string, taskId: string) {
    setBusyTaskId(taskId)
    setError('')
    const res = await fetch(`/api/admin/sessions/${sessionId}`, { method: 'PATCH' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Arrêt impossible')
      setBusyTaskId(null)
      return
    }
    await load()
    setBusyTaskId(null)
  }

  async function deleteSession(sessionId: string, taskId: string, taskStatus: string) {
    if (taskStatus === 'DONE' || taskStatus === 'VALIDATED') {
      setError('Impossible de supprimer du temps sur une tâche verrouillée')
      return
    }
    const reason = window.prompt('Motif de suppression du chrono :')
    if (!reason || !reason.trim()) return
    setBusyTaskId(taskId)
    setError('')
    const res = await fetch(`/api/admin/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || 'Suppression impossible')
      setBusyTaskId(null)
      return
    }
    await load()
    setBusyTaskId(null)
  }

  const totalSeconds = tasks.reduce((acc, t) => acc + t.totalSeconds, 0)
  const totalCost = tasks.reduce((acc, t) => acc + t.cost, 0)
  const totalDays = totalSeconds / (hoursPerDay * 3600)

  if (loading) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
  if (!project) return null

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Clock size={20} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Temps</h2>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(240,235,228,0.3)' }}>1 jour = {hoursPerDay}h · TJM {formatAmount(project.tjm, currency, 0)}</span>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)', color: '#fca5a5', fontSize: 13 }}>
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <p style={{ color: 'rgba(240,235,228,0.3)', fontSize: 13 }}>Aucune tâche sur ce projet.</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 90px 120px', gap: 10, padding: '6px 12px', fontSize: 11, color: 'rgba(240,235,228,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Tâche</span><span>Phase</span><span style={{ textAlign: 'right' }}>Temps</span><span style={{ textAlign: 'right' }}>Coût</span><span style={{ textAlign: 'right' }}>Action</span>
            </div>
            {tasks.map(t => (
              <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 90px 120px', gap: 10, alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 13, color: '#f0ebe4' }}>{t.title}</span>
                    <span style={{ marginLeft: 8, fontSize: 11, color: statusColors[t.status] }}>{statusLabels[t.status]}</span>
                    {t.openSessionId && (
                      <div style={{ marginTop: 4, fontSize: 11, color: '#fbbf24' }}>
                        En cours depuis {new Date(t.openStartedAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>{t.phaseName}</span>
                  <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.7)', textAlign: 'right', fontFamily: 'monospace' }}>{formatDuration(t.totalSeconds, hoursPerDay)}</span>
                  <span style={{ fontSize: 13, color: '#e8946a', textAlign: 'right', fontFamily: 'monospace' }}>{formatAmount(t.cost, currency)}</span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {t.openSessionId ? (
                      <button onClick={() => void stopTask(t.openSessionId!, t.id)} disabled={busyTaskId === t.id}
                        style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(248,113,113,0.14)', color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        {busyTaskId === t.id ? '...' : 'Stop'}
                      </button>
                    ) : (
                      <button onClick={() => void startTask(t.id)} disabled={busyTaskId === t.id || t.status === 'DONE' || t.status === 'VALIDATED'}
                        style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: t.status === 'DONE' || t.status === 'VALIDATED' ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: t.status === 'DONE' || t.status === 'VALIDATED' ? 'rgba(240,235,228,0.3)' : '#fff', cursor: t.status === 'DONE' || t.status === 'VALIDATED' ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700 }}>
                        {busyTaskId === t.id ? '...' : 'Démarrer'}
                      </button>
                    )}
                  </div>
                </div>

                {t.sessions.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {t.sessions.slice(0, 3).map(session => (
                      <div key={session.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: 12, color: 'rgba(240,235,228,0.5)' }}>
                        <span>{new Date(session.startedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                        <span>{new Date(session.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ color: 'rgba(240,235,228,0.25)' }}>→</span>
                        <span>{new Date(session.endedAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span style={{ color: 'rgba(240,235,228,0.35)' }}>{session.user.pseudo || session.user.name || 'Utilisateur'}</span>
                        <span style={{ marginLeft: 'auto', color: 'rgba(240,235,228,0.7)', fontWeight: 600 }}>{formatDuration(session.durationSeconds!, hoursPerDay)}</span>
                        <span style={{ color: '#e8946a' }}>{formatAmount((session.durationSeconds! / (hoursPerDay * 3600)) * project.tjm, currency)}</span>
                        <button onClick={() => void deleteSession(session.id, t.id, t.status)} disabled={t.status === 'DONE' || t.status === 'VALIDATED' || busyTaskId === t.id}
                          style={{ background: 'none', border: 'none', color: t.status === 'DONE' || t.status === 'VALIDATED' ? 'rgba(240,235,228,0.2)' : 'rgba(248,113,113,0.6)', cursor: t.status === 'DONE' || t.status === 'VALIDATED' ? 'not-allowed' : 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>
                          ×
                        </button>
                      </div>
                    ))}
                    {t.sessions.length > 3 && (
                      <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.28)', paddingLeft: 8 }}>
                        {t.sessions.length - 3} autre{t.sessions.length - 3 > 1 ? 's' : ''} session{t.sessions.length - 3 > 1 ? 's' : ''} non affichée{t.sessions.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 16px', background: 'rgba(232,148,106,0.08)', border: '1px solid rgba(232,148,106,0.2)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.6)', fontWeight: 600 }}>Total projet</div>
              {totalDays >= 1 && (
                <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>{totalDays.toFixed(2)} j · base {hoursPerDay}h/j</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <span style={{ fontSize: 15, color: '#f0ebe4', fontFamily: 'monospace', fontWeight: 700 }}>{formatDuration(totalSeconds, hoursPerDay)}</span>
              <span style={{ fontSize: 15, color: '#e8946a', fontFamily: 'monospace', fontWeight: 700 }}>{formatAmount(totalCost, currency)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
