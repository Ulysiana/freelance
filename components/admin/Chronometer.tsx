'use client'

import { useEffect, useState, useRef } from 'react'

type TimeSession = {
  id: string
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  user: { id: string; name: string | null; pseudo: string | null }
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`
}

function formatLive(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function Chronometer({ taskId, tjm }: { taskId: string; tjm: number }) {
  const [sessions, setSessions] = useState<TimeSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<Date | null>(null)

  async function load() {
    const res = await fetch(`/api/admin/tasks/${taskId}/sessions`)
    const data = await res.json()
    setSessions(data.sessions || [])
    const open = (data.sessions || []).find((s: TimeSession) => !s.endedAt)
    if (open) {
      setActiveSessionId(open.id)
      startRef.current = new Date(open.startedAt)
      const diff = Math.floor((Date.now() - new Date(open.startedAt).getTime()) / 1000)
      setElapsed(diff)
    }
  }

  useEffect(() => { load() }, [taskId])

  useEffect(() => {
    if (activeSessionId) {
      intervalRef.current = setInterval(() => {
        if (startRef.current) {
          setElapsed(Math.floor((Date.now() - startRef.current.getTime()) / 1000))
        }
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setElapsed(0)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeSessionId])

  async function start() {
    setLoading(true)
    const res = await fetch(`/api/admin/tasks/${taskId}/sessions`, { method: 'POST' })
    const data = await res.json()
    setActiveSessionId(data.session.id)
    startRef.current = new Date(data.session.startedAt)
    setElapsed(0)
    setLoading(false)
    load()
  }

  async function stop() {
    if (!activeSessionId) return
    setLoading(true)
    await fetch(`/api/admin/sessions/${activeSessionId}`, { method: 'PATCH' })
    setActiveSessionId(null)
    startRef.current = null
    setLoading(false)
    load()
  }

  async function deleteSession(id: string) {
    await fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' })
    setSessions(s => s.filter(x => x.id !== id))
  }

  const [expanded, setExpanded] = useState(false)
  const completedSessions = sessions.filter(s => s.endedAt && s.durationMinutes != null)
  const totalMinutes = completedSessions.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0)
  const costPerMinute = tjm / 480
  const totalCost = totalMinutes * costPerMinute
  const visibleSessions = expanded ? completedSessions : completedSessions.slice(0, 5)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 700, color: activeSessionId ? '#e8946a' : 'rgba(240,235,228,0.5)', minWidth: 100 }}>
          {activeSessionId ? formatLive(elapsed) : '00:00:00'}
        </div>
        <button
          onClick={activeSessionId ? stop : start}
          disabled={loading}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: activeSessionId ? 'rgba(248,113,113,0.15)' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: activeSessionId ? '#f87171' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          {loading ? '...' : activeSessionId ? '⏹ Stop' : '▶ Démarrer'}
        </button>
        {totalMinutes > 0 && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.7)' }}>{formatDuration(totalMinutes)} total</div>
            <div style={{ fontSize: 12, color: '#e8946a' }}>{totalCost.toFixed(2)} €</div>
          </div>
        )}
      </div>

      {completedSessions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {visibleSessions.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: 12, color: 'rgba(240,235,228,0.5)' }}
              onMouseEnter={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '1')}
              onMouseLeave={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '0')}>
              <span>{new Date(s.startedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
              <span>{new Date(s.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span style={{ color: 'rgba(240,235,228,0.25)' }}>→</span>
              <span>{new Date(s.endedAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span style={{ marginLeft: 'auto', color: 'rgba(240,235,228,0.7)', fontWeight: 600 }}>{formatDuration(s.durationMinutes!)}</span>
              <span style={{ color: '#e8946a' }}>{((s.durationMinutes! * costPerMinute)).toFixed(2)} €</span>
              <button className="del-btn" onClick={() => deleteSession(s.id)}
                style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, opacity: 0, transition: 'opacity 0.15s' }}>×</button>
            </div>
          ))}
          {completedSessions.length > 5 && (
            <button onClick={() => setExpanded(e => !e)}
              style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.35)', cursor: 'pointer', fontSize: 11, padding: '4px 10px', textAlign: 'left' }}>
              {expanded ? '▲ Réduire' : `▼ Voir ${completedSessions.length - 5} de plus`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
