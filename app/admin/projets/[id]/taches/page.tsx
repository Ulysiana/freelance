'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href={`/admin/projets/${id}`} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 20, textDecoration: 'none' }}>←</Link>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)', marginBottom: 2 }}>{projectName}</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Phases & Tâches</h1>
        </div>
      </div>

      {loading ? <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p> : (
        <PhaseBoard
          phases={phases}
          projectId={id}
          isAdmin={true}
          taskBasePath={`/admin/projets/${id}/taches`}
        />
      )}
    </div>
  )
}
