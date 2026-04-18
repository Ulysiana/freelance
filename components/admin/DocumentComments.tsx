'use client'

import { useEffect, useState } from 'react'

type Comment = {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string | null; pseudo: string | null; role: string }
}

export default function DocumentComments({
  documentId,
  currentUserId,
  currentUserRole,
}: {
  documentId: string
  currentUserId: string
  currentUserRole: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    const res = await fetch(`/api/documents/${documentId}/comments`)
    const data = await res.json()
    setComments(data.comments || [])
  }

  useEffect(() => { load() }, [documentId])

  async function send() {
    if (!text.trim()) return
    setSending(true)
    await fetch(`/api/documents/${documentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })
    setText('')
    setSending(false)
    load()
  }

  async function del(id: string) {
    setComments(c => c.filter(x => x.id !== id))
    await fetch(`/api/document-comments/${id}`, { method: 'DELETE' })
  }

  const authorName = (a: Comment['author']) => a.pseudo || a.name || 'Utilisateur'
  const isAdmin = (role: string) => role === 'ADMIN'

  return (
    <div>
      {comments.length === 0 && (
        <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.25)', marginBottom: 12 }}>Aucune remarque.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 10 }}
            onMouseEnter={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '1')}
            onMouseLeave={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '0')}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: isAdmin(c.author.role) ? 'rgba(232,148,106,0.2)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: isAdmin(c.author.role) ? '#e8946a' : 'rgba(240,235,228,0.5)', flexShrink: 0, fontWeight: 700 }}>
              {authorName(c.author).charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: isAdmin(c.author.role) ? '#e8946a' : 'rgba(240,235,228,0.7)' }}>{authorName(c.author)}</span>
                <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)' }}>{new Date(c.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} {new Date(c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                {(c.author.id === currentUserId || currentUserRole === 'ADMIN') && (
                  <button className="del-btn" onClick={() => del(c.id)} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', fontSize: 13, padding: 0, opacity: 0, transition: 'opacity 0.15s', marginLeft: 4 }}>×</button>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.75)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{c.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ajouter une remarque… (Entrée pour envoyer)"
          rows={2}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
        <button onClick={send} disabled={sending || !text.trim()}
          style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'rgba(232,148,106,0.12)', color: '#e8946a', cursor: 'pointer', fontSize: 12, opacity: !text.trim() ? 0.4 : 1, alignSelf: 'flex-end' }}>
          Envoyer
        </button>
      </div>
    </div>
  )
}
