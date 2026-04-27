'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Plus, Trash2, ChevronRight, Clock, Upload, File, Download, Eye, Paperclip } from 'lucide-react'

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

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<'docs' | 'files'>('docs')
  const [docs, setDocs] = useState<Doc[]>([])
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/projects/${id}/documents`).then(r => r.json()),
      fetch(`/api/admin/projects/${id}/files`).then(r => r.json()),
    ]).then(([docsData, filesData]) => {
      setDocs(docsData.documents || [])
      setFiles(filesData.files || [])
    })
  }, [id])

  async function create() {
    if (!newTitle.trim()) return
    setCreating(true)
    const res = await fetch(`/api/admin/projects/${id}/documents`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    const data = await res.json()
    setCreating(false)
    setNewTitle('')
    router.push(`/bureau/projets/${id}/documents/${data.document.id}`)
  }

  async function del(docId: string, e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm('Supprimer ce document ?')) return
    setDocs(d => d.filter(x => x.id !== docId))
    await fetch(`/api/admin/documents/${docId}`, { method: 'DELETE' })
  }

  async function uploadFile(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`/api/admin/projects/${id}/files`, { method: 'POST', body: formData })
    const data = await res.json()
    if (data.file) setFiles(f => [data.file, ...f])
    setUploading(false)
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await uploadFile(file)
    e.target.value = ''
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) await uploadFile(file)
  }

  async function openFile(fileId: string, download = false) {
    const res = await fetch(`/api/admin/files/${fileId}/signed-url${download ? '?download=1' : ''}`)
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  async function deleteFile(fileId: string) {
    if (!confirm('Supprimer ce fichier ?')) return
    setFiles(f => f.filter(x => x.id !== fileId))
    await fetch(`/api/admin/files/${fileId}`, { method: 'DELETE' })
  }

  const tabStyle = (active: boolean) => ({
    padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
    background: active ? 'rgba(232,148,106,0.15)' : 'transparent',
    color: active ? '#e8946a' : 'rgba(240,235,228,0.4)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <FileText size={20} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Documents et fichiers</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
            Centralise les contenus texte et les pièces jointes du projet.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, width: 'fit-content' }}>
        <button style={tabStyle(tab === 'docs')} onClick={() => setTab('docs')}>
          <FileText size={12} strokeWidth={2} style={{ display: 'inline', marginRight: 6 }} />
          Texte ({docs.length})
        </button>
        <button style={tabStyle(tab === 'files')} onClick={() => setTab('files')}>
          <Paperclip size={12} strokeWidth={2} style={{ display: 'inline', marginRight: 6 }} />
          Fichiers ({files.length})
        </button>
      </div>

      {tab === 'docs' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <input
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && create()}
              placeholder="Titre du nouveau document..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none' }} />
            <button onClick={create} disabled={creating || !newTitle.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: !newTitle.trim() ? 0.5 : 1 }}>
              <Plus size={14} strokeWidth={2.5} /> Créer
            </button>
          </div>

          {docs.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucun document texte pour ce projet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {docs.map(doc => (
                <Link key={doc.id} href={`/bureau/projets/${id}/documents/${doc.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,148,106,0.3)'; (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '1') }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '0') }}>
                    <FileText size={16} strokeWidth={1.5} style={{ color: 'rgba(232,148,106,0.6)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{doc.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>
                        <Clock size={10} strokeWidth={1.8} />
                        {new Date(doc.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {doc.author.pseudo || doc.author.name}
                      </div>
                    </div>
                    <button className="del-btn" onClick={e => del(doc.id, e)}
                      style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 4, opacity: 0, transition: 'opacity 0.15s' }}>
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                    <ChevronRight size={15} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.2)', flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'files' && (
        <>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#e8946a' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12, padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'rgba(232,148,106,0.05)' : 'rgba(255,255,255,0.02)',
              marginBottom: 20, transition: 'all 0.15s',
            }}>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileInput} />
            <Upload size={24} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.3)', marginBottom: 8 }} />
            <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.5)' }}>
              {uploading ? 'Envoi en cours...' : 'Glisser un fichier ici ou cliquer pour sélectionner'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)', marginTop: 4 }}>PDF, Word, Excel, images, ZIP…</div>
          </div>

          {files.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucun fichier pour ce projet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {files.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{fileIcon(f.mimeType)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>
                      {formatSize(f.size)} · {new Date(f.uploadedAt).toLocaleDateString('fr-FR')} · {f.uploadedBy.pseudo || f.uploadedBy.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => openFile(f.id)} title="Ouvrir"
                      style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12, gap: 4 }}>
                      <Eye size={13} strokeWidth={1.8} />
                    </button>
                    <button onClick={() => openFile(f.id, true)} title="Télécharger"
                      style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12, gap: 4 }}>
                      <Download size={13} strokeWidth={1.8} />
                    </button>
                    <button onClick={() => deleteFile(f.id)} title="Supprimer"
                      style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(248,113,113,0.4)', cursor: 'pointer', fontSize: 12 }}>
                      <Trash2 size={13} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
