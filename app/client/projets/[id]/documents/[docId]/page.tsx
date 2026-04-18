'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronRight, Clock, Download, FileText } from 'lucide-react'
import { linkifyHtmlContent } from '@/lib/richText'

const DocumentComments = dynamic(() => import('@/components/admin/DocumentComments'), { ssr: false })

type Doc = {
  id: string
  title: string
  content: string
  updatedAt: string
  project: { id: string; name: string }
  author: { id: string; name: string | null; pseudo: string | null }
}

export default function ClientDocumentPage() {
  const { id, docId } = useParams<{ id: string; docId: string }>()
  const [doc, setDoc] = useState<Doc | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/admin/documents/${docId}`).then(r => r.json()).then(d => setDoc(d.document))
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setCurrentUserId(d.user?.id || '')
      setCurrentUserRole(d.user?.role || '')
    })
  }, [docId])

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    if (!printRef.current || !doc) return
    const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let y = 10
    let remaining = imgHeight
    while (remaining > 0) {
      pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight)
      remaining -= pageHeight - 20
      if (remaining > 0) { pdf.addPage(); y = 10 - (imgHeight - remaining) }
    }
    pdf.save(`${doc.title}.pdf`)
  }

  if (!doc) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>

  const authorName = doc.author.pseudo || doc.author.name || 'Creahub Solutions'

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'rgba(240,235,228,0.35)', flexWrap: 'wrap' }}>
        <Link href="/client/projets" style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/client/projets/${id}`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{doc.project.name}</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/client/projets/${id}/documents`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Documents</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.7)' }}>{doc.title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
        <FileText size={20} strokeWidth={1.8} style={{ color: '#e8946a', marginTop: 4 }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{doc.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(240,235,228,0.35)', marginTop: 8, flexWrap: 'wrap' }}>
            <Clock size={12} strokeWidth={1.8} />
            Mis à jour le {new Date(doc.updatedAt).toLocaleDateString('fr-FR')} par {authorName}
          </div>
        </div>
        <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.7)', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
          <Download size={12} strokeWidth={1.8} /> PDF
        </button>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 28px', background: 'rgba(255,255,255,0.02)', marginBottom: 24 }}>
        <div className="rich-content" style={{ fontSize: 14, color: 'rgba(240,235,228,0.8)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: linkifyHtmlContent(doc.content) }} />
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Remarques</label>
        {currentUserId && <DocumentComments documentId={docId} currentUserId={currentUserId} currentUserRole={currentUserRole} />}
      </div>

      <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: 700, padding: 40, background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: 24, marginBottom: 24, borderBottom: '2px solid #e8946a', paddingBottom: 12 }}>{doc.title}</h1>
        <div className="rich-content" style={{ fontSize: 14, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: linkifyHtmlContent(doc.content) }} />
        <div style={{ marginTop: 40, fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 12 }}>
          Creahub Solutions · {doc.project.name} · {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  )
}
