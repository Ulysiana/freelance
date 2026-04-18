'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'

type Message = {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string | null; pseudo: string | null; role: string }
}

export default function MessageThread({ projectId, currentUserId, currentUserRole }: {
  projectId: string
  currentUserId: string
  currentUserRole: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isAdmin = currentUserRole === 'ADMIN'

  const markSeen = (msgs: Message[]) => {
    const stored = JSON.parse(localStorage.getItem('seen_messages') || '[]') as string[]
    const updated = Array.from(new Set([...stored, ...msgs.map(m => m.id)]))
    localStorage.setItem('seen_messages', JSON.stringify(updated))
  }

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/projects/${projectId}/messages`)
    const data = await res.json()
    const msgs: Message[] = data.messages || []
    setMessages(msgs)
    markSeen(msgs)
  }, [projectId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!text.trim()) return
    setSending(true)
    const res = await fetch(`/api/admin/projects/${projectId}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })
    const data = await res.json()
    setMessages(m => [...m, data.message])
    setText('')
    setSending(false)
  }

  const authorName = (a: Message['author']) => a.pseudo || a.name || 'Utilisateur'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Fil de messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300, maxHeight: 500 }}>
        {messages.length === 0 && (
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.25)', textAlign: 'center', marginTop: 40 }}>Aucun message pour l'instant.</p>
        )}
        {messages.map(m => {
          const isMine = m.author.id === currentUserId
          const isAdminMsg = m.author.role === 'ADMIN'
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '72%' }}>
                {!isMine && (
                  <div style={{ fontSize: 11, color: isAdminMsg ? '#e8946a' : 'rgba(240,235,228,0.4)', marginBottom: 3, paddingLeft: 4 }}>
                    {authorName(m.author)}
                  </div>
                )}
                <div style={{
                  padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMine
                    ? 'linear-gradient(135deg, #e8946a, #c27b5b)'
                    : isAdminMsg ? 'rgba(232,148,106,0.12)' : 'rgba(255,255,255,0.06)',
                  color: isMine ? '#fff' : '#f0ebe4',
                  fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                  border: !isMine ? `1px solid ${isAdminMsg ? 'rgba(232,148,106,0.2)' : 'rgba(255,255,255,0.08)'}` : 'none',
                }}>
                  {m.content}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(240,235,228,0.25)', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                  {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Saisie */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Écrire un message… (Entrée pour envoyer)"
          rows={2}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', color: '#f0ebe4', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
        <button onClick={send} disabled={sending || !text.trim()}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, borderRadius: 12, border: 'none', background: text.trim() ? 'linear-gradient(135deg, #e8946a, #c27b5b)' : 'rgba(255,255,255,0.05)', color: text.trim() ? '#fff' : 'rgba(240,235,228,0.3)', cursor: text.trim() ? 'pointer' : 'default', transition: 'all 0.15s', alignSelf: 'flex-end', height: 44 }}>
          <Send size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
