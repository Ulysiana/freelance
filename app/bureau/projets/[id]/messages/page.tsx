'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import MessageThread from '@/components/admin/MessageThread'

export default function AdminMessagesPage() {
  const { id } = useParams<{ id: string }>()
  const [projectName, setProjectName] = useState('')
  const [me, setMe] = useState<{ id: string; role: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/projects/${id}`).then(r => r.json()),
      fetch('/api/admin/me').then(r => r.json()),
    ]).then(([projData, meData]) => {
      setProjectName(projData.project?.name || '')
      setMe(meData.user)
    })
  }, [id])

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Échanges</h2>
      <p style={{ marginTop: 0, marginBottom: 20, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        Conversation continue autour du projet{projectName ? ` ${projectName}` : ''}.
      </p>

      <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', minHeight: 0 }}>
        {me && (
          <MessageThread projectId={id} currentUserId={me.id} currentUserRole={me.role} />
        )}
      </div>
    </div>
  )
}
