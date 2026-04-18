'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Plus, Trash2, ChevronRight, Clock } from 'lucide-react'

type Doc = {
  id: string; title: string; content: string; updatedAt: string
  author: { id: string; name: string | null; pseudo: string | null }
}

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [docs, setDocs] = useState<Doc[]>([])
  const [projectName, setProjectName] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    const [projRes, docsRes] = await Promise.all([
      fetch(`/api/admin/projects/${id}`),
      fetch(`/api/admin/projects/${id}/documents`),
    ])
    const projData = await projRes.json()
    const docsData = await docsRes.json()
    setProjectName(projData.project?.name || '')
    setDocs(docsData.documents || [])
  }

  useEffect(() => { load() }, [id])

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

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>
        <Link href="/bureau/projets" style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/bureau/projets/${id}`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{projectName || '…'}</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.6)' }}>Documents</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <FileText size={20} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Documents</h1>
      </div>

      {/* Nouveau document */}
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
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)' }}>Aucun document pour ce projet.</p>
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
    </div>
  )
}
