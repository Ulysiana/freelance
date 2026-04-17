'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PhaseBoard from '@/components/admin/PhaseBoard'

type Phase = { id: string; name: string; order: number; tasks: { id: string; title: string; status: string; description: string | null }[] }

export default function ClientProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [phases, setPhases] = useState<Phase[]>([])
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/phases?projectId=${id}`).then(r => r.json()),
      fetch(`/api/client/projects`).then(r => r.json()),
    ]).then(([phasesData, projectsData]) => {
      setPhases(phasesData.phases || [])
      const project = (projectsData.projects || []).find((p: { id: string; name: string }) => p.id === id)
      setProjectName(project?.name || '')
      setLoading(false)
    })
  }, [id])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/client/projets" style={{ color: 'rgba(240,235,228,0.4)', fontSize: 20, textDecoration: 'none' }}>←</Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, flex: 1 }}>{projectName}</h1>
        <Link href={`/client/projets/${id}/demandes`} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
          Mes demandes →
        </Link>
      </div>
      {loading ? <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p> : (
        <PhaseBoard phases={phases} projectId={id} isAdmin={false} taskBasePath={`/client/projets/${id}/taches`} />
      )}
    </div>
  )
}
