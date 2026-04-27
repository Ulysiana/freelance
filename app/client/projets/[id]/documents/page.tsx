'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { FileText, Download, Clock, Eye, Paperclip, Globe } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { linkifyHtmlContent } from '@/lib/richText'

const HtmlPageGallery = dynamic(() => import('@/components/admin/HtmlPageGallery'), { ssr: false })

type Doc = {
  id: string; title: string; content: string; updatedAt: string
  author: { id: string; name: string | null; pseudo: string | null }
}

type ProjectFile = {
  id: string; originalName: string; mimeType: string; size: number; uploadedAt: string
  uploadedBy: { name: string | null; pseudo: string | null }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️'
  return '📁'
}

export default function ClientDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<'docs' | 'files' | 'pages'>('docs')
  const [docs, setDocs] = useState<Doc[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [projectName, setProjectName] = useState('')
  const [selected, setSelected] = useState<Doc | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/client/projects').then(r => r.json()),
      fetch(`/api/admin/projects/${id}/documents`).then(r => r.json()),
      fetch(`/api/admin/projects/${id}/files`).then(r => r.json()),
    ]).then(([projectsData, docsData, filesData]) => {
      const project = (projectsData.projects || []).find((p: { id: string; name: string }) => p.id === id)
      setProjectName(project?.name || '')
      setDocs(docsData.documents || [])
      setFiles(filesData.files || [])
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

  async function openFile(fileId: string, download = false) {
    const res = await fetch(`/api/admin/files/${fileId}/signed-url${download ? '?download=1' : ''}`)
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
    background: active ? 'rgba(232,148,106,0.15)' : 'transparent',
    color: active ? '#e8946a' : 'rgba(240,235,228,0.4)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, width: 'fit-content' }}>
        <button style={tabStyle(tab === 'docs')} onClick={() => setTab('docs')}>
          <FileText size={12} strokeWidth={2} style={{ display: 'inline', marginRight: 6 }} />
          Texte ({docs.length})
        </button>
        <button style={tabStyle(tab === 'files')} onClick={() => setTab('files')}>
          <Paperclip size={12} strokeWidth={2} style={{ display: 'inline', marginRight: 6 }} />
          Fichiers ({files.length})
        </button>
        <button style={tabStyle(tab === 'pages')} onClick={() => setTab('pages')}>
          <Globe size={12} strokeWidth={2} style={{ display: 'inline', marginRight: 6 }} />
          Pages
        </button>
      </div>

      {tab === 'docs' && (
        docs.length === 0 ? (
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucun document disponible.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {docs.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <FileText size={16} strokeWidth={1.5} style={{ color: 'rgba(232,148,106,0.6)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Link href={`/client/projets/${id}/documents/${doc.id}`} style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4', textDecoration: 'none' }}>
                    {doc.title}
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>
                    <Clock size={10} strokeWidth={1.8} />
                    {new Date(doc.updatedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <Link href={`/client/projets/${id}/documents/${doc.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.6)', textDecoration: 'none', fontSize: 12 }}>
                  <Eye size={12} strokeWidth={1.8} /> Consulter
                </Link>
                <button onClick={() => exportPDF(doc)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.6)', cursor: 'pointer', fontSize: 12 }}>
                  <Download size={12} strokeWidth={1.8} /> PDF
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'files' && (
        files.length === 0 ? (
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucun fichier disponible.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {files.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{fileIcon(f.mimeType)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>
                    {formatSize(f.size)} · {new Date(f.uploadedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openFile(f.id)} title="Ouvrir"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12 }}>
                    <Eye size={13} strokeWidth={1.8} />
                  </button>
                  <button onClick={() => openFile(f.id, true)} title="Télécharger"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12 }}>
                    <Download size={13} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'pages' && <HtmlPageGallery projectId={id} isAdmin={false} />}

      {selected && (
        <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: 700, padding: 40, background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: 24, marginBottom: 24, borderBottom: '2px solid #e8946a', paddingBottom: 12 }}>{selected.title}</h1>
          <div className="rich-content" style={{ fontSize: 14, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: linkifyHtmlContent(selected.content) }} />
          <div style={{ marginTop: 40, fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 12 }}>
            Creahub Solutions · {projectName} · {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>
      )}
    </div>
  )
}
