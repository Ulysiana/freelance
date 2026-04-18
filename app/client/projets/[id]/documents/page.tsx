'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FileText, Download, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'

type Doc = {
  id: string; title: string; content: string; updatedAt: string
  author: { id: string; name: string | null; pseudo: string | null }
}

export default function ClientDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [projectName, setProjectName] = useState('')
  const [selected, setSelected] = useState<Doc | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/client/projects').then(r => r.json()),
      fetch(`/api/admin/projects/${id}/documents`).then(r => r.json()),
    ]).then(([projectsData, docsData]) => {
      const project = (projectsData.projects || []).find((p: { id: string; name: string }) => p.id === id)
      setProjectName(project?.name || '')
      setDocs(docsData.documents || [])
    })
  }, [id])

  async function exportPDF(doc: Doc) {
    setSelected(doc)
    await new Promise(r => setTimeout(r, 100))
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    if (!printRef.current) return
    const canvas = await html2canvas(printRef.current, { backgroundColor: '#ffffff', scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
    pdf.save(`${doc.title}.pdf`)
    setSelected(null)
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>
        <Link href="/client/projets" style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/client/projets/${id}`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{projectName || '…'}</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.6)' }}>Documents</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <FileText size={20} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Documents</h1>
      </div>

      {docs.length === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucun document disponible.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <FileText size={16} strokeWidth={1.5} style={{ color: 'rgba(232,148,106,0.6)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{doc.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>
                  <Clock size={10} strokeWidth={1.8} />
                  {new Date(doc.updatedAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <button onClick={() => exportPDF(doc)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.6)', cursor: 'pointer', fontSize: 12 }}>
                <Download size={12} strokeWidth={1.8} /> PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone cachée pour export PDF */}
      {selected && (
        <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: 700, padding: 40, background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: 24, marginBottom: 24, borderBottom: '2px solid #e8946a', paddingBottom: 12 }}>{selected.title}</h1>
          <div style={{ fontSize: 14, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: selected.content }} />
          <div style={{ marginTop: 40, fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 12 }}>
            Creahub Solutions · {projectName} · {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>
      )}
    </div>
  )
}
