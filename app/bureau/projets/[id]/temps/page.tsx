'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type TaskTime = {
  id: string
  title: string
  status: string
  totalMinutes: number
  cost: number
  phaseName: string
}

type ProjectData = {
  id: string
  name: string
  tjm: number
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`
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
  const router = useRouter()
  const [project, setProject] = useState<ProjectData | null>(null)
  const [tasks, setTasks] = useState<TaskTime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [projRes, timeRes] = await Promise.all([
        fetch(`/api/admin/projects/${id}`),
        fetch(`/api/admin/projects/${id}/temps`),
      ])
      const projData = await projRes.json()
      const timeData = await timeRes.json()
      setProject(projData.project)
      setTasks(timeData.tasks || [])
      setLoading(false)
    }
    load()
  }, [id])

  const totalMinutes = tasks.reduce((acc, t) => acc + t.totalMinutes, 0)
  const totalCost = tasks.reduce((acc, t) => acc + t.cost, 0)

  if (loading) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
  if (!project) return null

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push(`/bureau/projets/${id}`)} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#f0ebe4', margin: 0 }}>Suivi du temps</h1>
          <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>{project.name} · TJM {project.tjm} €</span>
        </div>
      </div>

      {tasks.filter(t => t.totalMinutes > 0).length === 0 ? (
        <p style={{ color: 'rgba(240,235,228,0.3)', fontSize: 13 }}>Aucun temps enregistré sur ce projet.</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 80px', gap: 10, padding: '6px 12px', fontSize: 11, color: 'rgba(240,235,228,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Tâche</span><span>Phase</span><span style={{ textAlign: 'right' }}>Temps</span><span style={{ textAlign: 'right' }}>Coût</span>
            </div>
            {tasks.filter(t => t.totalMinutes > 0).map(t => (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 80px', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, color: '#f0ebe4' }}>{t.title}</span>
                  <span style={{ marginLeft: 8, fontSize: 11, color: statusColors[t.status] }}>{statusLabels[t.status]}</span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>{t.phaseName}</span>
                <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.7)', textAlign: 'right', fontFamily: 'monospace' }}>{formatDuration(t.totalMinutes)}</span>
                <span style={{ fontSize: 13, color: '#e8946a', textAlign: 'right', fontFamily: 'monospace' }}>{t.cost.toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '14px 16px', background: 'rgba(232,148,106,0.08)', border: '1px solid rgba(232,148,106,0.2)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.6)', fontWeight: 600 }}>Total projet</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <span style={{ fontSize: 15, color: '#f0ebe4', fontFamily: 'monospace', fontWeight: 700 }}>{formatDuration(totalMinutes)}</span>
              <span style={{ fontSize: 15, color: '#e8946a', fontFamily: 'monospace', fontWeight: 700 }}>{totalCost.toFixed(2)} €</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
