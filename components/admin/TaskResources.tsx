'use client'

import { useEffect, useState } from 'react'
import { FileText, Image, Globe, X, Plus, ExternalLink } from 'lucide-react'

type TaskResource = {
  id: string
  file?:     { id: string; originalName: string; mimeType: string; size: number } | null
  page?:     { id: string; title: string } | null
  document?: { id: string; title: string } | null
}

type ProjectFile = { id: string; originalName: string; mimeType: string; size: number }
type HtmlPage    = { id: string; title: string }
type Document    = { id: string; title: string }

function mimeIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
  return <FileText size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
}

function resourceLabel(r: TaskResource): string {
  if (r.file) return r.file.originalName
  if (r.page) return r.page.title
  if (r.document) return r.document.title
  return 'Ressource'
}

function resourceIcon(r: TaskResource) {
  if (r.file) return mimeIcon(r.file.mimeType)
  if (r.page) return <Globe size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
  return <FileText size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
}

export default function TaskResources({ taskId, projectId, locked }: { taskId: string; projectId: string; locked: boolean }) {
  const [resources, setResources] = useState<TaskResource[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [tab, setTab] = useState<'files' | 'pages' | 'docs'>('files')
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [pages, setPages] = useState<HtmlPage[]>([])
  const [docs, setDocs] = useState<Document[]>([])
  const [loadingPicker, setLoadingPicker] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)

  async function loadResources() {
    const res = await fetch(`/api/admin/tasks/${taskId}/resources`)
    const data = await res.json()
    setResources(data.resources || [])
  }

  useEffect(() => { loadResources() }, [taskId])

  async function openPicker() {
    setShowPicker(true)
    setLoadingPicker(true)
    const [fRes, pRes, dRes] = await Promise.all([
      fetch(`/api/admin/projects/${projectId}/files`).then(r => r.json()),
      fetch(`/api/admin/projects/${projectId}/pages`).then(r => r.json()),
      fetch(`/api/admin/projects/${projectId}/documents`).then(r => r.json()),
    ])
    setFiles(fRes.files || [])
    setPages(pRes.pages || [])
    setDocs(dRes.documents || [])
    setLoadingPicker(false)
  }

  async function attach(payload: { fileId?: string; pageId?: string; docId?: string }) {
    await fetch(`/api/admin/tasks/${taskId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setShowPicker(false)
    loadResources()
  }

  async function detach(resourceId: string) {
    await fetch(`/api/admin/task-resources/${resourceId}`, { method: 'DELETE' })
    setResources(rs => rs.filter(r => r.id !== resourceId))
  }

  async function openResource(r: TaskResource) {
    if (r.page) {
      setOpeningId(r.id)
      const res = await fetch(`/api/admin/pages/${r.page.id}`)
      const data = await res.json()
      setOpeningId(null)
      if (data.url) window.open(data.url, '_blank')
      return
    }
    if (r.document) {
      window.open(`/bureau/projets/${projectId}/documents/${r.document.id}`, '_blank')
      return
    }
    if (r.file) {
      setOpeningId(r.id)
      const res = await fetch(`/api/admin/files/${r.file.id}/signed-url`)
      const data = await res.json()
      setOpeningId(null)
      if (data.url) window.open(data.url, '_blank')
    }
  }

  const alreadyLinked = {
    files: new Set(resources.map(r => r.file?.id).filter(Boolean)),
    pages: new Set(resources.map(r => r.page?.id).filter(Boolean)),
    docs:  new Set(resources.map(r => r.document?.id).filter(Boolean)),
  }

  return (
    <div>
      {/* Picker modal */}
      {showPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPicker(false) }}>
          <div style={{ background: '#141210', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '24px', maxWidth: 480, width: '94%', maxHeight: '75vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4' }}>Attacher un document</div>
              <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
            </div>

            {/* Onglets */}
            <div style={{ display: 'flex', gap: 6 }}>
              {([['files', 'Fichiers'], ['pages', 'Pages HTML'], ['docs', 'Documents']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.08)', background: tab === key ? 'rgba(255,255,255,0.08)' : 'transparent', color: tab === key ? '#f0ebe4' : 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 12, fontWeight: tab === key ? 600 : 400 }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {loadingPicker ? (
                <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)', margin: 0 }}>Chargement…</p>
              ) : (
                <>
                  {tab === 'files' && (files.length === 0
                    ? <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)', margin: 0 }}>Aucun fichier dans ce projet.</p>
                    : files.map(f => (
                      <button key={f.id} onClick={() => !alreadyLinked.files.has(f.id) && attach({ fileId: f.id })}
                        disabled={alreadyLinked.files.has(f.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: alreadyLinked.files.has(f.id) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)', cursor: alreadyLinked.files.has(f.id) ? 'default' : 'pointer', textAlign: 'left', width: '100%' }}>
                        {mimeIcon(f.mimeType)}
                        <span style={{ flex: 1, fontSize: 13, color: alreadyLinked.files.has(f.id) ? 'rgba(240,235,228,0.3)' : '#f0ebe4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</span>
                        {alreadyLinked.files.has(f.id) && <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>déjà lié</span>}
                      </button>
                    ))
                  )}
                  {tab === 'pages' && (pages.length === 0
                    ? <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)', margin: 0 }}>Aucune page HTML dans ce projet.</p>
                    : pages.map(p => (
                      <button key={p.id} onClick={() => !alreadyLinked.pages.has(p.id) && attach({ pageId: p.id })}
                        disabled={alreadyLinked.pages.has(p.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: alreadyLinked.pages.has(p.id) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)', cursor: alreadyLinked.pages.has(p.id) ? 'default' : 'pointer', textAlign: 'left', width: '100%' }}>
                        <Globe size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: alreadyLinked.pages.has(p.id) ? 'rgba(240,235,228,0.3)' : '#f0ebe4' }}>{p.title}</span>
                        {alreadyLinked.pages.has(p.id) && <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>déjà lié</span>}
                      </button>
                    ))
                  )}
                  {tab === 'docs' && (docs.length === 0
                    ? <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)', margin: 0 }}>Aucun document dans ce projet.</p>
                    : docs.map(d => (
                      <button key={d.id} onClick={() => !alreadyLinked.docs.has(d.id) && attach({ docId: d.id })}
                        disabled={alreadyLinked.docs.has(d.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: alreadyLinked.docs.has(d.id) ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)', cursor: alreadyLinked.docs.has(d.id) ? 'default' : 'pointer', textAlign: 'left', width: '100%' }}>
                        <FileText size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: alreadyLinked.docs.has(d.id) ? 'rgba(240,235,228,0.3)' : '#f0ebe4' }}>{d.title}</span>
                        {alreadyLinked.docs.has(d.id) && <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>déjà lié</span>}
                      </button>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Liste des ressources liées */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {resources.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
            {resourceIcon(r)}
            <button onClick={() => openResource(r)} disabled={openingId === r.id}
              style={{ flex: 1, background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: '#7dd3fc', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
              {openingId === r.id ? 'Ouverture…' : resourceLabel(r)}
              <ExternalLink size={11} strokeWidth={1.8} style={{ flexShrink: 0, opacity: 0.5 }} />
            </button>
            {!locked && (
              <button onClick={() => detach(r.id)} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 2, flexShrink: 0, display: 'flex' }}>
                <X size={14} strokeWidth={1.8} />
              </button>
            )}
          </div>
        ))}

        {!locked && (
          <button onClick={openPicker}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.1)', background: 'none', color: 'rgba(240,235,228,0.35)', cursor: 'pointer', fontSize: 12, width: '100%' }}>
            <Plus size={13} strokeWidth={1.8} />
            Attacher un document…
          </button>
        )}
      </div>
    </div>
  )
}
