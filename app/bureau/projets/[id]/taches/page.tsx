'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import PhaseBoard from '@/components/admin/PhaseBoard'

type Phase = { id: string; name: string; order: number; tasks: { id: string; title: string; status: string; description: string | null }[] }

export default function TachesPage() {
  const { id } = useParams<{ id: string }>()
  const [phases, setPhases] = useState<Phase[]>([])
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/phases?projectId=${id}`).then(r => r.json()),
      fetch(`/api/admin/projects/${id}`).then(r => r.json()),
    ]).then(([phasesData, projectData]) => {
      setPhases(phasesData.phases || [])
      setProjectName(projectData.project?.name || '')
      setLoading(false)
    })
  }, [id])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>
        <Link href="/bureau/projets" style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/bureau/projets/${id}`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{projectName || '…'}</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.6)' }}>Phases & Tâches</span>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Phases & Tâches</h1>

      {loading ? <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p> : (
        <PhaseBoard
          phases={phases}
          projectId={id}
          isAdmin={true}
          taskBasePath={`/bureau/projets/${id}/taches`}
        />
      )}
    </div>
  )
}
