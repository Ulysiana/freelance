'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        <Link href="/admin/projets" style={{ color: 'inherit', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <Link href={`/admin/projets/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{projectName || '…'}</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span style={{ color: '#f0ebe4' }}>Messages</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Messagerie</h1>

      <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', minHeight: 0 }}>
        {me && (
          <MessageThread projectId={id} currentUserId={me.id} currentUserRole={me.role} />
        )}
      </div>
    </div>
  )
}
