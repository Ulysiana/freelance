'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronRight, Save, Trash2, Download, FileText } from 'lucide-react'

const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false })

type Doc = {
  id: string; title: string; content: string; updatedAt: string
  project: { id: string; name: string }
  author: { id: string; name: string | null; pseudo: string | null }
}

export default function DocumentEditPage() {
  const { id, docId } = useParams<{ id: string; docId: string }>()
  const router = useRouter()
  const [doc, setDoc] = useState<Doc | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/admin/documents/${docId}`).then(r => r.json()).then(d => {
      setDoc(d.document)
      setTitle(d.document.title)
      setContent(d.document.content)
    })
  }, [docId])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/admin/documents/${docId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce document ?')) return
    await fetch(`/api/admin/documents/${docId}`, { method: 'DELETE' })
    router.push(`/bureau/projets/${id}/documents`)
  }

  async function handleExportPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    if (!printRef.current) return
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
    pdf.save(`${title}.pdf`)
  }

  if (!doc) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>
        <Link href="/bureau/projets" style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/bureau/projets/${id}`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{doc.project.name}</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/bureau/projets/${id}/documents`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Documents</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.6)' }}>{title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <FileText size={18} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <input value={title} onChange={e => setTitle(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 22, fontWeight: 700, color: '#f0ebe4' }} />
      </div>

      <RichEditor value={content} onChange={setContent} />

      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.7)', cursor: 'pointer', fontSize: 13 }}>
          <Download size={13} strokeWidth={1.8} /> PDF
        </button>
        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 8, border: 'none', background: saved ? 'rgba(134,239,172,0.15)' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: saved ? '#86efac' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          <Save size={13} strokeWidth={2} />{saved ? 'Enregistré' : saving ? '...' : 'Enregistrer'}
        </button>
        <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 8, background: 'none', border: '1px solid rgba(220,50,50,0.25)', color: 'rgba(248,113,113,0.7)', cursor: 'pointer', fontSize: 13, marginLeft: 'auto' }}>
          <Trash2 size={13} strokeWidth={1.8} />
          Supprimer
        </button>
      </div>

      {/* Zone cachée pour l'export PDF */}
      <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: 700, padding: 40, background: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: 24, marginBottom: 24, borderBottom: '2px solid #e8946a', paddingBottom: 12 }}>{title}</h1>
        <div style={{ fontSize: 14, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: content }} />
        <div style={{ marginTop: 40, fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 12 }}>
          Creahub Solutions · {doc.project.name} · {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  )
}
