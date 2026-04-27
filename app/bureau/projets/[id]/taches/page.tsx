'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PhaseBoard from '@/components/admin/PhaseBoard'

type Phase = { id: string; name: string; order: number; tasks: { id: string; title: string; status: string; description: string | null }[] }

export default function TachesPage() {
  const { id } = useParams<{ id: string }>()
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/phases?projectId=${id}`)
      .then(r => r.json())
      .then(phasesData => {
        setPhases(phasesData.phases || [])
        setLoading(false)
      })
  }, [id])

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Phases & tâches</h2>
      <p style={{ marginTop: 0, marginBottom: 24, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        Organise le travail du projet par phases, tâches et statuts.
      </p>

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
