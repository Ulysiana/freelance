'use client'

import { useEffect, useState, useRef } from 'react'
import { formatDuration, formatLive } from '@/lib/formatTime'

type TimeSession = {
  id: string
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null
  user: { id: string; name: string | null; pseudo: string | null }
}

type DeleteModal = { sessionId: string; label: string }

export default function Chronometer({ taskId, tjm, taskStatus, compact }: { taskId: string; tjm: number; taskStatus: string; compact?: boolean }) {
  const [sessions, setSessions] = useState<TimeSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hoursPerDay, setHoursPerDay] = useState(8)
  const [showHistory, setShowHistory] = useState(false)
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<Date | null>(null)
  const reasonRef = useRef<HTMLTextAreaElement>(null)

  async function load() {
    const [sessRes, settRes] = await Promise.all([
      fetch(`/api/admin/tasks/${taskId}/sessions`),
      fetch('/api/admin/settings'),
    ])
    const data = await sessRes.json()
    const sett = await settRes.json()
    setHoursPerDay(sett.hoursPerDay || 8)
    setSessions(data.sessions || [])
    const open = (data.sessions || []).find((s: TimeSession) => !s.endedAt)
    setActiveSessionId(open?.id || null)
    startRef.current = open ? new Date(open.startedAt) : null
    setElapsed(open ? Math.floor((Date.now() - new Date(open.startedAt).getTime()) / 1000) : 0)
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/tasks/${taskId}/sessions`),
      fetch('/api/admin/settings'),
    ]).then(async ([sessRes, settRes]) => {
      const data = await sessRes.json()
      const sett = await settRes.json()
      setHoursPerDay(sett.hoursPerDay || 8)
      setSessions(data.sessions || [])
      const open = (data.sessions || []).find((s: TimeSession) => !s.endedAt)
      setActiveSessionId(open?.id || null)
      startRef.current = open ? new Date(open.startedAt) : null
      setElapsed(open ? Math.floor((Date.now() - new Date(open.startedAt).getTime()) / 1000) : 0)
    })
  }, [taskId])

  useEffect(() => {
    if (activeSessionId) {
      intervalRef.current = setInterval(() => {
        if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current.getTime()) / 1000))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeSessionId])

  useEffect(() => {
    if (deleteModal) setTimeout(() => reasonRef.current?.focus(), 50)
  }, [deleteModal])

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

  function openDeleteModal(s: TimeSession) {
    const date = new Date(s.startedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const duration = formatDuration(s.durationSeconds!, hoursPerDay)
    setDeleteModal({ sessionId: s.id, label: `${date} · ${duration}` })
    setDeleteReason('')
  }

  async function confirmDelete() {
    if (!deleteModal || !deleteReason.trim()) return
    setDeleting(true)
    const res = await fetch(`/api/admin/sessions/${deleteModal.sessionId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: deleteReason.trim() }),
    })
    const data = await res.json().catch(() => ({}))
    setDeleting(false)
    if (!res.ok) {
      alert(data.error || 'Suppression impossible')
      return
    }
    setSessions(s => s.filter(x => x.id !== deleteModal.sessionId))
    setDeleteModal(null)
    setDeleteReason('')
  }

  const secondsPerDay = hoursPerDay * 3600
  const costPerSecond = tjm / secondsPerDay
  const completedSessions = sessions.filter(s => s.endedAt && s.durationSeconds != null)
  const totalSeconds = completedSessions.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0)
  const totalCost = totalSeconds * costPerSecond
  const locked = taskStatus === 'DONE' || taskStatus === 'VALIDATED'

  if (compact) return (
    <>
      {/* Modales partagées avec le compact */}
      {showHistory && !deleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowHistory(false) }}>
          <div style={{ background: '#141210', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '24px', maxWidth: 520, width: '94%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4' }}>Historique des sessions</div>
                <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)', marginTop: 2 }}>
                  {completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''} · {formatDuration(totalSeconds, hoursPerDay)} · {totalCost.toFixed(2)} €
                </div>
              </div>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {completedSessions.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.025)', fontSize: 12, color: 'rgba(240,235,228,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '1')}
                  onMouseLeave={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '0')}>
                  <span style={{ minWidth: 36, flexShrink: 0 }}>{new Date(s.startedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                  <span style={{ flexShrink: 0 }}>{new Date(s.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span style={{ color: 'rgba(240,235,228,0.2)', flexShrink: 0 }}>→</span>
                  <span style={{ flexShrink: 0 }}>{new Date(s.endedAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  {(s.user.pseudo || s.user.name) && (
                    <span style={{ color: 'rgba(240,235,228,0.25)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.user.pseudo || s.user.name}</span>
                  )}
                  <span style={{ marginLeft: 'auto', color: 'rgba(240,235,228,0.75)', fontWeight: 600, fontFamily: 'monospace', flexShrink: 0 }}>{formatDuration(s.durationSeconds!, hoursPerDay)}</span>
                  <span style={{ color: '#e8946a', fontFamily: 'monospace', flexShrink: 0 }}>{(s.durationSeconds! * costPerSecond).toFixed(2)} €</span>
                  <button className="del-btn" onClick={() => !locked && openDeleteModal(s)} disabled={locked}
                    style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: locked ? 'not-allowed' : 'pointer', fontSize: 16, lineHeight: 1, padding: 0, opacity: locked ? 0.15 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setDeleteModal(null); setDeleteReason('') } }}>
          <div style={{ background: '#141210', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '28px 28px 24px', maxWidth: 420, width: '90%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', marginBottom: 6 }}>Supprimer ce chrono ?</div>
              <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.45)', lineHeight: 1.5 }}>
                Session du <strong style={{ color: 'rgba(240,235,228,0.7)' }}>{deleteModal.label}</strong>.<br />
                Cette action est irréversible et sera journalisée.
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Motif de suppression <span style={{ color: '#f87171' }}>*</span>
              </label>
              <textarea ref={reasonRef} value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) confirmDelete() }}
                placeholder="Saisie erronée, doublon, test…" rows={3}
                style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setDeleteModal(null); setDeleteReason('') }}
                style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
              <button onClick={confirmDelete} disabled={deleting || !deleteReason.trim()}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: deleteReason.trim() ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)', color: deleteReason.trim() ? '#f87171' : 'rgba(240,235,228,0.2)', fontWeight: 700, cursor: deleteReason.trim() ? 'pointer' : 'not-allowed', fontSize: 13, transition: 'all 0.15s' }}>
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${activeSessionId ? 'rgba(232,148,106,0.3)' : 'rgba(255,255,255,0.08)'}`, flexShrink: 0 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: activeSessionId ? '#e8946a' : 'rgba(240,235,228,0.35)', minWidth: 68 }}>
          {activeSessionId ? formatLive(elapsed) : '00:00:00'}
        </span>
        {totalSeconds > 0 && <span style={{ fontSize: 11, color: '#e8946a' }}>{totalCost.toFixed(0)}€</span>}
        <button onClick={activeSessionId ? stop : start} disabled={loading}
          style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: activeSessionId ? 'rgba(248,113,113,0.15)' : 'rgba(232,148,106,0.15)', color: activeSessionId ? '#f87171' : '#e8946a', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 11 }}>
          {loading ? '…' : activeSessionId ? '⏹' : '▶'}
        </button>
        {completedSessions.length > 0 && (
          <button onClick={() => setShowHistory(true)} title="Voir l'historique"
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '3px 7px', color: 'rgba(240,235,228,0.35)', cursor: 'pointer', fontSize: 10 }}>
            {completedSessions.length} ↗
          </button>
        )}
      </div>
    </>
  )

  return (
    <div>
      {/* Modale historique */}
      {showHistory && !deleteModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowHistory(false) }}
        >
          <div style={{ background: '#141210', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '24px', maxWidth: 520, width: '94%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4' }}>Historique des sessions</div>
                <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)', marginTop: 2 }}>
                  {completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''} · {formatDuration(totalSeconds, hoursPerDay)} · {totalCost.toFixed(2)} €
                </div>
              </div>
              <button onClick={() => setShowHistory(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {completedSessions.map(s => (
                <div key={s.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.025)', fontSize: 12, color: 'rgba(240,235,228,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '1')}
                  onMouseLeave={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '0')}
                >
                  <span style={{ minWidth: 36, flexShrink: 0 }}>{new Date(s.startedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                  <span style={{ flexShrink: 0 }}>{new Date(s.startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span style={{ color: 'rgba(240,235,228,0.2)', flexShrink: 0 }}>→</span>
                  <span style={{ flexShrink: 0 }}>{new Date(s.endedAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  {(s.user.pseudo || s.user.name) && (
                    <span style={{ color: 'rgba(240,235,228,0.25)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.user.pseudo || s.user.name}</span>
                  )}
                  <span style={{ marginLeft: 'auto', color: 'rgba(240,235,228,0.75)', fontWeight: 600, fontFamily: 'monospace', flexShrink: 0 }}>{formatDuration(s.durationSeconds!, hoursPerDay)}</span>
                  <span style={{ color: '#e8946a', fontFamily: 'monospace', flexShrink: 0 }}>{(s.durationSeconds! * costPerSecond).toFixed(2)} €</span>
                  <button className="del-btn" onClick={() => !locked && openDeleteModal(s)} disabled={locked}
                    style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: locked ? 'not-allowed' : 'pointer', fontSize: 16, lineHeight: 1, padding: 0, opacity: locked ? 0.15 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {deleteModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) { setDeleteModal(null); setDeleteReason('') } }}
        >
          <div style={{ background: '#141210', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '28px 28px 24px', maxWidth: 420, width: '90%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0ebe4', marginBottom: 6 }}>Supprimer ce chrono ?</div>
              <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.45)', lineHeight: 1.5 }}>
                Session du <strong style={{ color: 'rgba(240,235,228,0.7)' }}>{deleteModal.label}</strong>.<br />
                Cette action est irréversible et sera journalisée.
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                Motif de suppression <span style={{ color: '#f87171' }}>*</span>
              </label>
              <textarea
                ref={reasonRef}
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) confirmDelete() }}
                placeholder="Saisie erronée, doublon, test…"
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setDeleteModal(null); setDeleteReason('') }}
                style={{ flex: 1, padding: '9px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 13 }}>
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting || !deleteReason.trim()}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: deleteReason.trim() ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)', color: deleteReason.trim() ? '#f87171' : 'rgba(240,235,228,0.2)', fontWeight: 700, cursor: deleteReason.trim() ? 'pointer' : 'not-allowed', fontSize: 13, transition: 'all 0.15s' }}>
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ligne chrono — layout fixe, ne bouge pas selon l'état */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 140px 1fr auto', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${activeSessionId ? 'rgba(232,148,106,0.2)' : 'rgba(255,255,255,0.07)'}`, transition: 'border-color 0.2s' }}>
        {/* Timer */}
        <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: activeSessionId ? '#e8946a' : 'rgba(240,235,228,0.4)' }}>
          {activeSessionId ? formatLive(elapsed) : '00:00:00'}
        </div>

        {/* Start / Stop */}
        <button onClick={activeSessionId ? stop : start} disabled={loading}
          style={{ padding: '8px 0', borderRadius: 8, border: 'none', background: activeSessionId ? 'rgba(248,113,113,0.15)' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: activeSessionId ? '#f87171' : '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, textAlign: 'center' }}>
          {loading ? '...' : activeSessionId ? '⏹ Stop' : '▶ Démarrer'}
        </button>

        {/* Total — toujours présent, invisible si rien */}
        <div style={{ visibility: totalSeconds > 0 ? 'visible' : 'hidden' }}>
          <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.65)', fontFamily: 'monospace' }}>{formatDuration(totalSeconds, hoursPerDay)}</span>
          <span style={{ fontSize: 12, color: '#e8946a', marginLeft: 8, fontFamily: 'monospace' }}>{totalCost.toFixed(2)} €</span>
        </div>

        {/* Bouton historique — toujours présent, invisible si aucune session */}
        <button
          onClick={() => setShowHistory(true)}
          disabled={completedSessions.length === 0}
          title="Voir l'historique des sessions"
          style={{ visibility: completedSessions.length > 0 ? 'visible' : 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 10px', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap' }}>
          {completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''} ↗
        </button>
      </div>
    </div>
  )
}
