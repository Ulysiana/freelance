'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/formatTime'

type TaskTime = {
  id: string
  title: string
  status: string
  totalSeconds: number
  cost: number
  phaseName: string
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

  useEffect(() => {
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
      setHoursPerDay(sett.hoursPerDay || 8)
      setLoading(false)
    }
    load()
  }, [id])

  const totalSeconds = tasks.reduce((acc, t) => acc + t.totalSeconds, 0)
  const totalCost = tasks.reduce((acc, t) => acc + t.cost, 0)
  const totalDays = totalSeconds / (hoursPerDay * 3600)

  if (loading) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
  if (!project) return null

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        <Link href="/bureau/projets" style={{ color: 'inherit', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <Link href={`/bureau/projets/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{project.name}</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span style={{ color: '#f0ebe4' }}>Temps</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Clock size={20} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Suivi du temps</h1>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(240,235,228,0.3)' }}>1 jour = {hoursPerDay}h · TJM {project.tjm} €</span>
      </div>

      {tasks.filter(t => t.totalSeconds > 0).length === 0 ? (
        <p style={{ color: 'rgba(240,235,228,0.3)', fontSize: 13 }}>Aucun temps enregistré sur ce projet.</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 80px', gap: 10, padding: '6px 12px', fontSize: 11, color: 'rgba(240,235,228,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Tâche</span><span>Phase</span><span style={{ textAlign: 'right' }}>Temps</span><span style={{ textAlign: 'right' }}>Coût</span>
            </div>
            {tasks.filter(t => t.totalSeconds > 0).map(t => (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 80px', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, color: '#f0ebe4' }}>{t.title}</span>
                  <span style={{ marginLeft: 8, fontSize: 11, color: statusColors[t.status] }}>{statusLabels[t.status]}</span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>{t.phaseName}</span>
                <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.7)', textAlign: 'right', fontFamily: 'monospace' }}>{formatDuration(t.totalSeconds, hoursPerDay)}</span>
                <span style={{ fontSize: 13, color: '#e8946a', textAlign: 'right', fontFamily: 'monospace' }}>{t.cost.toFixed(2)} €</span>
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
              <span style={{ fontSize: 15, color: '#e8946a', fontFamily: 'monospace', fontWeight: 700 }}>{totalCost.toFixed(2)} €</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
