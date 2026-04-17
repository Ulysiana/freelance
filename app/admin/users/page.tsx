'use client'

import { useEffect, useState } from 'react'

type User = { id: string; name: string | null; pseudo: string | null; email: string; role: string; createdAt: string }
type ModalState = { mode: 'create' } | { mode: 'edit'; user: User } | null

const ROLES = ['ADMIN', 'COLLABORATEUR', 'CLIENT']

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '9px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'rgba(240,235,228,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'block',
}

function UserModal({ modal, onClose, onSaved }: { modal: ModalState; onClose: () => void; onSaved: () => void }) {
  const isEdit = modal?.mode === 'edit'
  const user = isEdit ? modal.user : null

  const [name, setName] = useState(user?.name || '')
  const [pseudo, setPseudo] = useState(user?.pseudo || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(user?.role || 'CLIENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/users/${user!.id}` : '/api/admin/users'
      const method = isEdit ? 'PATCH' : 'POST'
      const body: Record<string, string> = { name, pseudo, email, role }
      if (password) body.password = password
      if (!isEdit) body.password = password

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      onSaved()
      onClose()
    } catch {
      setError('Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 420 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>{isEdit ? 'Modifier' : 'Créer'} un utilisateur</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <div><label style={labelStyle}>Nom complet</label><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" /></div>
          <div><label style={labelStyle}>Pseudo / Société</label><input style={inputStyle} value={pseudo} onChange={e => setPseudo(e.target.value)} placeholder="Creahub Solutions" /></div>
          <div><label style={labelStyle}>Email *</label><input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div>
            <label style={labelStyle}>{isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required={!isEdit} />
          </div>
          <div>
            <label style={labelStyle}>Rôle</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => <option key={r} value={r} style={{ background: '#111' }}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.6)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : isEdit ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalState>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  function load() {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      setUsers(data.users || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    setDeleting(id)
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    load()
    setDeleting(null)
  }

  const roleColor = (role: string) => role === 'ADMIN' ? '#e8946a' : role === 'COLLABORATEUR' ? '#7dd3fc' : 'rgba(240,235,228,0.5)'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Utilisateurs</h1>
        <button onClick={() => setModal({ mode: 'create' })} style={{ padding: '9px 20px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          + Nouvel utilisateur
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
      ) : (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Nom', 'Pseudo / Société', 'Email', 'Rôle', 'Créé le', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'rgba(240,235,228,0.35)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{u.name || '—'}</td>
                  <td style={{ padding: '14px 16px', color: 'rgba(240,235,228,0.7)' }}>{u.pseudo || '—'}</td>
                  <td style={{ padding: '14px 16px', color: 'rgba(240,235,228,0.55)' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: `1px solid ${roleColor(u.role)}33`, color: roleColor(u.role) }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'rgba(240,235,228,0.35)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setModal({ mode: 'edit', user: u })} style={{ padding: '5px 12px', borderRadius: 6, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.6)', cursor: 'pointer', fontSize: 12 }}>Modifier</button>
                      <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id} style={{ padding: '5px 12px', borderRadius: 6, background: 'none', border: '1px solid rgba(220,50,50,0.25)', color: 'rgba(248,113,113,0.7)', cursor: 'pointer', fontSize: 12, opacity: deleting === u.id ? 0.5 : 1 }}>
                        {deleting === u.id ? '...' : 'Supprimer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <UserModal modal={modal} onClose={() => setModal(null)} onSaved={load} />}
    </div>
  )
}
