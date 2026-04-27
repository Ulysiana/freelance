'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Download, Trash2, FileText, ImageIcon, FileArchive, File, X, Eye } from 'lucide-react'

type Attachment = {
  id: string
  originalName: string
  mimeType: string
  size: number
  uploadedAt: string
  uploadedBy: { id: string; name: string | null; pseudo: string | null }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const props = { size: 14, strokeWidth: 1.8, style: { flexShrink: 0 } as React.CSSProperties }
  if (mimeType.startsWith('image/')) return <ImageIcon {...props} />
  if (mimeType === 'application/pdf' || mimeType.includes('document') || mimeType.includes('text')) return <FileText {...props} />
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return <FileArchive {...props} />
  return <File {...props} />
}

function canPreview(mimeType: string) {
  return mimeType.startsWith('image/') || mimeType === 'application/pdf' ||
    mimeType === 'text/html' ||
    mimeType.includes('wordprocessingml') || mimeType.includes('spreadsheetml') ||
    mimeType.includes('msword') || mimeType.includes('ms-excel')
}

function Viewer({ att, onClose }: { att: Attachment & { signedUrl?: string }; onClose: () => void }) {
  const isImage = att.mimeType.startsWith('image/')
  const isPdf = att.mimeType === 'application/pdf'
  const isOffice = att.mimeType.includes('wordprocessingml') || att.mimeType.includes('spreadsheetml') || att.mimeType.includes('msword') || att.mimeType.includes('ms-excel')
  const url = att.signedUrl || ''
  const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: 'rgba(240,235,228,0.6)', cursor: 'pointer' }}>
        <X size={24} strokeWidth={1.8} />
      </button>
      <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.5)', marginBottom: 12 }}>{att.originalName}</div>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 900, height: '80vh', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        {isImage && <img src={url} alt={att.originalName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
        {isPdf && <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} />}
        {isOffice && <iframe src={officeUrl} style={{ width: '100%', height: '100%', border: 'none' }} />}
      </div>
    </div>
  )
}

export default function AttachmentUploader({ taskId, isAdmin, locked = false }: { taskId: string; isAdmin: boolean; locked?: boolean }) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [viewing, setViewing] = useState<(Attachment & { signedUrl?: string }) | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch(`/api/admin/tasks/${taskId}/attachments`)
    const data = await res.json()
    setAttachments(data.attachments || [])
  }

  useEffect(() => {
    fetch(`/api/admin/tasks/${taskId}/attachments`)
      .then(res => res.json())
      .then(data => setAttachments(data.attachments || []))
  }, [taskId])

  async function uploadFile(file: File) {
    if (locked) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('taskId', taskId)
    await fetch('/api/admin/upload', { method: 'POST', body: form })
    setUploading(false)
    load()
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) await uploadFile(file)
  }

  async function del(id: string) {
    if (locked) return
    setAttachments(a => a.filter(x => x.id !== id))
    await fetch(`/api/admin/attachments/${id}`, { method: 'DELETE' })
  }

  async function preview(att: Attachment) {
    const res = await fetch(`/api/admin/attachments/${att.id}/signed-url`)
    const data = await res.json()
    setViewing({ ...att, signedUrl: data.url })
  }

  return (
    <div>
      {viewing && <Viewer att={viewing} onClose={() => setViewing(null)} />}
      {/* Zone de dépôt */}
      <div
        onClick={() => inputRef.current?.click()}
        onClickCapture={e => { if (locked) e.preventDefault() }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); if (!locked) void handleFiles(e.dataTransfer.files) }}
        style={{ border: `1px dashed ${dragOver ? '#e8946a' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '20px', textAlign: 'center', cursor: locked ? 'not-allowed' : 'pointer', background: dragOver ? 'rgba(232,148,106,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.15s', marginBottom: 12, opacity: locked ? 0.6 : 1 }}>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} disabled={locked} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {uploading
            ? <span style={{ fontSize: 13, color: '#e8946a' }}>Envoi en cours...</span>
            : <>
                <Upload size={18} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.3)' }} />
                <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>{locked ? 'Ajout verrouillé sur une tâche terminée' : <>Glisser-déposer ou <span style={{ color: '#e8946a' }}>parcourir</span></>}</span>
                <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.2)' }}>Max 20 Mo par fichier</span>
              </>
          }
        </div>
      </div>

      {/* Liste des fichiers */}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {attachments.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '1')}
              onMouseLeave={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '0')}>
              <FileIcon mimeType={a.mimeType} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.originalName}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)' }}>
                  {formatSize(a.size)} · {a.uploadedBy.pseudo || a.uploadedBy.name} · {new Date(a.uploadedAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
              {canPreview(a.mimeType) && (
                <button onClick={() => preview(a)} style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer' }}>
                  <Eye size={13} strokeWidth={1.8} />
                </button>
              )}
              <a href={`/api/admin/attachments/${a.id}`} download={a.originalName}
                style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'rgba(240,235,228,0.5)', textDecoration: 'none' }}>
                <Download size={13} strokeWidth={1.8} />
              </a>
              {isAdmin && (
                <button className="del-btn" onClick={() => del(a.id)} disabled={locked}
                  style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: locked ? 'not-allowed' : 'pointer', padding: '4px', opacity: locked ? 0.2 : 0, transition: 'opacity 0.15s' }}>
                  <Trash2 size={13} strokeWidth={1.8} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !uploading && (
        <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.2)', margin: 0 }}>Aucun fichier joint.</p>
      )}
    </div>
  )
}
