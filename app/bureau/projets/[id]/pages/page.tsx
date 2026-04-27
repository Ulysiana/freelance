'use client'

import { useParams } from 'next/navigation'
import { Globe } from 'lucide-react'
import dynamic from 'next/dynamic'

const HtmlPageGallery = dynamic(() => import('@/components/admin/HtmlPageGallery'), { ssr: false })

export default function PagesAdminPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Globe size={20} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Pages HTML</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
            Réunit les maquettes et pages exportées liées au projet.
          </p>
        </div>
      </div>

      <HtmlPageGallery projectId={id} isAdmin={true} />
    </div>
  )
}
