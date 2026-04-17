'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Copy, Check, Plus, Mail, Clock, UserCheck, AlertCircle } from 'lucide-react'

type Invitation = {
  id: string
  token: string
  email: string | null
  role: string
  usedAt: string | null
  expiresAt: string
  createdAt: string
  creator: { name: string | null; pseudo: string | null }
}

const roleLabel: Record<string, string> = { CLIENT: 'Client', ADMIN: 'Admin', COLLABORATEUR: 'Collaborateur' }
const roleColor: Record<string, string> = { CLIENT: '#7dd3fc', ADMIN: '#e8946a', COLLABORATEUR: '#86efac' }

function CopyLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/rejoindre/${token}`
  function copy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: copied ? '#86efac' : 'rgba(240,235,228,0.5)', fontSize: 12, cursor: 'pointer' }}>
      {copied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={1.8} />}
      {copied ? 'Copié !' : 'Copier le lien'}
    </button>
  )
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [form, setForm] = useState({ role: 'CLIENT', email: '', sendEmail: false })
  const [newLink, setNewLink] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/invitations')
    const data = await res.json()
    setInvitations(data.invitations || [])
  }

  useEffect(() => { load() }, [])

  async function create() {
    setCreating(true)
    const res = await fetch('/api/admin/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setCreating(false)
    if (data.link) {
      setNewLink(data.link)
      setForm({ role: 'CLIENT', email: '', sendEmail: false })
      setShowForm(false)
      load()
    }
  }

  const isExpired = (d: string) => new Date(d) < new Date()

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        <Link href="/bureau" style={{ color: 'inherit', textDecoration: 'none' }}>Tableau de bord</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span style={{ color: '#f0ebe4' }}>Invitations</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, flex: 1 }}>Invitations</h1>
        <button onClick={() => { setShowForm(s => !s); setNewLink('') }}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={14} strokeWidth={2} /> Nouvelle invitation
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 24px', marginBottom: 20, background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['CLIENT', 'COLLABORATEUR', 'ADMIN'] as const).map(r => (
                <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${form.role === r ? roleColor[r] + '66' : 'rgba(255,255,255,0.08)'}`, background: form.role === r ? roleColor[r] + '12' : 'none', color: form.role === r ? roleColor[r] : 'rgba(240,235,228,0.5)', fontSize: 13, cursor: 'pointer', fontWeight: form.role === r ? 600 : 400 }}>
                  {roleLabel[r]}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="email" placeholder="Email (optionnel)" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none' }} />
              {form.email && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(240,235,228,0.5)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={form.sendEmail} onChange={e => setForm(f => ({ ...f, sendEmail: e.target.checked }))} />
                  Envoyer par email
                </label>
              )}
            </div>
            <button onClick={create} disabled={creating}
              style={{ padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {creating ? 'Génération...' : 'Générer le lien'}
            </button>
          </div>
        </div>
      )}

      {newLink && (
        <div style={{ border: '1px solid rgba(134,239,172,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, background: 'rgba(134,239,172,0.04)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: '#86efac', fontWeight: 600 }}>Lien généré !</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code style={{ flex: 1, fontSize: 12, color: 'rgba(240,235,228,0.5)', wordBreak: 'break-all', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 6 }}>{newLink}</code>
            <button onClick={() => { navigator.clipboard.writeText(newLink) }}
              style={{ flexShrink: 0, padding: '7px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12 }}>
              <Copy size={13} strokeWidth={1.8} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', margin: 0 }}>Partagez ce lien par SMS, WhatsApp, email ou tout autre canal. Il expire dans 7 jours.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {invitations.length === 0 && <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)' }}>Aucune invitation.</p>}
        {invitations.map(inv => {
          const expired = isExpired(inv.expiresAt)
          const used = !!inv.usedAt
          return (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', opacity: expired || used ? 0.5 : 1 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: roleColor[inv.role] + '15', border: `1px solid ${roleColor[inv.role]}33`, color: roleColor[inv.role] }}>
                    {roleLabel[inv.role]}
                  </span>
                  {inv.email && <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} strokeWidth={1.5} />{inv.email}</span>}
                  {used && <span style={{ fontSize: 11, color: '#86efac', display: 'flex', alignItems: 'center', gap: 3 }}><UserCheck size={11} strokeWidth={1.8} />Utilisé</span>}
                  {!used && expired && <span style={{ fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 3 }}><AlertCircle size={11} strokeWidth={1.8} />Expiré</span>}
                  {!used && !expired && <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} strokeWidth={1.5} />Expire {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}</span>}
                </div>
              </div>
              {!used && !expired && <CopyLink token={inv.token} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
