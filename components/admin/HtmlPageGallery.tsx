'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, X, Trash2, ExternalLink, Globe, Eye } from 'lucide-react'

type HtmlPage = {
  id: string
  title: string
  filename: string
  createdAt: string
  uploadedBy: { id: string; name: string | null; pseudo: string | null }
}

export default function HtmlPageGallery({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
  const [pages, setPages] = useState<HtmlPage[]>([])
  const [viewing, setViewing] = useState<{ title: string; url: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch(`/api/admin/projects/${projectId}/pages`)
    const data = await res.json()
    setPages(data.pages || [])
  }

  useEffect(() => { load() }, [projectId])

  async function handleFile(file: File) {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) return
    setPendingFile(file)
    setNewTitle(file.name.replace(/\.html?$/, ''))
  }

  async function upload() {
    if (!pendingFile || !newTitle.trim()) return
    setUploading(true)
    const form = new FormData()
    form.append('file', pendingFile)
    form.append('title', newTitle)
    await fetch(`/api/admin/projects/${projectId}/pages`, { method: 'POST', body: form })
    setPendingFile(null)
    setNewTitle('')
    setUploading(false)
    load()
  }

  async function openPage(page: HtmlPage) {
    const res = await fetch(`/api/admin/pages/${page.id}`)
    const data = await res.json()
    setViewing({ title: page.title, url: data.url })
  }

  async function del(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Supprimer cette page ?')) return
    setPages(p => p.filter(x => x.id !== id))
    await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
  }

  return (
    <div>
      {/* Visionneuse plein écran */}
      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={16} strokeWidth={1.8} style={{ color: '#e8946a' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{viewing.title}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={viewing.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,235,228,0.6)', textDecoration: 'none', fontSize: 12 }}>
                <ExternalLink size={12} strokeWidth={1.8} /> Ouvrir dans un onglet
              </a>
              <button onClick={() => setViewing(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', color: 'rgba(240,235,228,0.6)', cursor: 'pointer', fontSize: 12 }}>
                <X size={14} strokeWidth={1.8} /> Fermer
              </button>
            </div>
          </div>
          <iframe
            src={viewing.url}
            sandbox="allow-scripts allow-same-origin allow-forms"
            style={{ flex: 1, border: 'none', background: '#fff' }}
          />
        </div>
      )}

      {/* Upload zone */}
      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          {!pendingFile ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              style={{ border: `1px dashed ${dragOver ? '#e8946a' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(232,148,106,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.15s' }}>
              <input ref={inputRef} type="file" accept=".html,.htm" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <Upload size={18} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.3)' }} />
                <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>Glisser-déposer ou <span style={{ color: '#e8946a' }}>parcourir</span> un fichier HTML</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, padding: 14, background: 'rgba(232,148,106,0.06)', border: '1px solid rgba(232,148,106,0.2)', borderRadius: 10 }}>
              <Globe size={16} style={{ color: '#e8946a', flexShrink: 0, marginTop: 2 }} strokeWidth={1.8} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)' }}>{pendingFile.name}</span>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Nom de la page..."
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={upload} disabled={uploading || !newTitle.trim()}
                    style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    {uploading ? 'Upload...' : 'Ajouter'}
                  </button>
                  <button onClick={() => setPendingFile(null)}
                    style={{ padding: '7px 12px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 13 }}>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grille de pages */}
      {pages.length === 0 ? (
        <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.2)' }}>Aucune page HTML pour ce projet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {pages.map(page => (
            <div key={page.id} onClick={() => openPage(page)}
              style={{ position: 'relative', padding: '20px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,148,106,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(232,148,106,0.05)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
                <Globe size={28} strokeWidth={1.2} style={{ color: 'rgba(232,148,106,0.6)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', lineHeight: 1.3 }}>{page.title}</span>
                <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)' }}>
                  {new Date(page.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#e8946a', opacity: 0.7 }}>
                  <Eye size={11} strokeWidth={1.8} /> Visualiser
                </div>
              </div>
              {isAdmin && (
                <button onClick={e => del(page.id, e)}
                  style={{ position: 'absolute', top: 8, right: 8, display: 'flex', background: 'none', border: 'none', color: 'rgba(248,113,113,0.4)', cursor: 'pointer', padding: 4, opacity: 0, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}>
                  <Trash2 size={13} strokeWidth={1.8} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
