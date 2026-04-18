'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FileText, Globe, MessageSquare, Clock, ChevronRight } from 'lucide-react'
import PhaseBoard from '@/components/admin/PhaseBoard'
import { formatDuration } from '@/lib/formatTime'

type Phase = { id: string; name: string; order: number; tasks: { id: string; title: string; status: string; description: string | null }[] }
type TimeData = { totalSeconds: number; cost: number; hoursPerDay: number }

export default function ClientProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [phases, setPhases] = useState<Phase[]>([])
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(true)
  const [timeData, setTimeData] = useState<TimeData | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/phases?projectId=${id}`).then(r => r.json()),
      fetch(`/api/client/projects`).then(r => r.json()),
      fetch(`/api/client/projects/${id}/temps`).then(r => r.json()),
    ]).then(([phasesData, projectsData, tempsData]) => {
      setPhases(phasesData.phases || [])
      const project = (projectsData.projects || []).find((p: { id: string; name: string }) => p.id === id)
      setProjectName(project?.name || '')
      if (tempsData.totalSeconds !== undefined) setTimeData(tempsData)
      setLoading(false)
    })
  }, [id])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        <Link href="/client/projets" style={{ color: 'inherit', textDecoration: 'none' }}>Mes projets</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span style={{ color: '#f0ebe4' }}>{projectName}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, flex: 1 }}>{projectName}</h1>
        <Link href={`/client/projets/${id}/documents`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.7)', fontSize: 12, textDecoration: 'none' }}>
          <FileText size={13} strokeWidth={1.8} /> Documents
        </Link>
        <Link href={`/client/projets/${id}/pages`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.7)', fontSize: 12, textDecoration: 'none' }}>
          <Globe size={13} strokeWidth={1.8} /> Pages HTML
        </Link>
        <Link href={`/client/projets/${id}/messages`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.7)', fontSize: 12, textDecoration: 'none' }}>
          <MessageSquare size={13} strokeWidth={1.8} /> Messages
        </Link>
        <Link href={`/client/projets/${id}/demandes`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
          Mes demandes →
        </Link>
      </div>
      {timeData && timeData.totalSeconds > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 24, fontSize: 13 }}>
          <Clock size={15} strokeWidth={1.8} style={{ color: '#e8946a', flexShrink: 0 }} />
          <span style={{ color: 'rgba(240,235,228,0.5)' }}>Temps travaillé :</span>
          <strong style={{ color: '#f0ebe4' }}>{formatDuration(timeData.totalSeconds, timeData.hoursPerDay)}</strong>
          <span style={{ color: '#e8946a', fontWeight: 600 }}>{timeData.cost.toFixed(2)} €</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>1 journée = {timeData.hoursPerDay}h (TJM)</span>
        </div>
      )}
      {loading ? <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p> : (
        <PhaseBoard phases={phases} projectId={id} isAdmin={false} taskBasePath={`/client/projets/${id}/taches`} />
      )}
    </div>
  )
}
