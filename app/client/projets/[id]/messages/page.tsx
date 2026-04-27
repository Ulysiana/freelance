'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import MessageThread from '@/components/admin/MessageThread'

export default function ClientMessagesPage() {
  const { id } = useParams<{ id: string }>()
  const [me, setMe] = useState<{ id: string; role: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => setMe(d.user))
  }, [])

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)' }}>
      <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', minHeight: 0 }}>
        {me && <MessageThread projectId={id} currentUserId={me.id} currentUserRole={me.role} />}
      </div>
    </div>
  )
}
