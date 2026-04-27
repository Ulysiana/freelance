'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle2 } from 'lucide-react'
import PhaseBoard from '@/components/admin/PhaseBoard'
import { formatDuration } from '@/lib/formatTime'

type Task = { id: string; title: string; status: string; description: string | null; phaseName?: string }
type Phase = { id: string; name: string; order: number; tasks: Omit<Task, 'phaseName'>[] }
type TimeData = { totalSeconds: number; cost: number; hoursPerDay: number }

export default function ClientProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)
  const [timeData, setTimeData] = useState<TimeData | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/phases?projectId=${id}`).then(r => r.json()),
      fetch(`/api/client/projects/${id}/temps`).then(r => r.json()),
    ]).then(([phasesData, tempsData]) => {
      setPhases(phasesData.phases || [])
      if (tempsData.totalSeconds !== undefined) setTimeData(tempsData)
      setLoading(false)
    })
  }, [id])

  const doneTasks: Task[] = phases.flatMap(ph =>
    ph.tasks.filter(t => t.status === 'DONE').map(t => ({ ...t, phaseName: ph.name }))
  )

  return (
    <div>
      {/* Tâches à valider */}
      {doneTasks.length > 0 && (
        <div style={{ marginBottom: 28, padding: '16px 20px', background: 'rgba(232,148,106,0.06)', border: '1px solid rgba(232,148,106,0.22)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={15} strokeWidth={1.8} style={{ color: '#e8946a' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e8946a' }}>
              {doneTasks.length} tâche{doneTasks.length > 1 ? 's' : ''} en attente de ta validation
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {doneTasks.map(task => (
              <Link key={task.id} href={`/client/projets/${id}/taches/${task.id}`}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(232,148,106,0.14)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', marginTop: 2 }}>{task.phaseName}</div>
                </div>
                <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(232,148,106,0.15)', color: '#e8946a', border: '1px solid rgba(232,148,106,0.3)', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 12 }}>
                  Valider →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Temps travaillé */}
      {timeData && timeData.totalSeconds > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 24, fontSize: 13, flexWrap: 'wrap' }}>
          <Clock size={15} strokeWidth={1.8} style={{ color: '#e8946a', flexShrink: 0 }} />
          <span style={{ color: 'rgba(240,235,228,0.5)' }}>Temps travaillé :</span>
          <strong style={{ color: '#f0ebe4' }}>{formatDuration(timeData.totalSeconds, timeData.hoursPerDay)}</strong>
          <span style={{ color: '#e8946a', fontWeight: 600 }}>{timeData.cost.toFixed(2)} €</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>1 journée = {timeData.hoursPerDay}h</span>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
      ) : (
        <PhaseBoard phases={phases} projectId={id} isAdmin={false} taskBasePath={`/client/projets/${id}/taches`} />
      )}
    </div>
  )
}
