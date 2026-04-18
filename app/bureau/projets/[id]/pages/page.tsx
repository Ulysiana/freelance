'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Globe, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

const HtmlPageGallery = dynamic(() => import('@/components/admin/HtmlPageGallery'), { ssr: false })

export default function PagesAdminPage() {
  const { id } = useParams<{ id: string }>()
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    fetch(`/api/admin/projects/${id}`).then(r => r.json()).then(d => setProjectName(d.project?.name || ''))
  }, [id])

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>
        <Link href="/bureau/projets" style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/bureau/projets/${id}`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{projectName || '…'}</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.6)' }}>Pages HTML</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Globe size={20} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Pages HTML</h1>
      </div>

      <HtmlPageGallery projectId={id} isAdmin={true} />
    </div>
  )
}
