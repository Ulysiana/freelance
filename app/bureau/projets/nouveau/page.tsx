'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = { id: string; name: string | null; pseudo: string | null; email: string; role: string }

const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { fontSize: 11, color: 'rgba(240,235,228,0.45)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4, display: 'block' }

export default function NouveauProjetPage() {
  const router = useRouter()
  const [clients, setClients] = useState<User[]>([])
  const [collabs, setCollabs] = useState<User[]>([])
  const [form, setForm] = useState({ name: '', description: '', tjm: '', clientId: '', collaboratorIds: [] as string[] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      const users: User[] = d.users || []
      setClients(users.filter(u => u.role === 'CLIENT'))
      setCollabs(users.filter(u => u.role === 'COLLABORATEUR'))
    })
  }, [])

  function toggleCollab(id: string) {
    setForm(f => ({
      ...f,
      collaboratorIds: f.collaboratorIds.includes(id)
        ? f.collaboratorIds.filter(c => c !== id)
        : f.collaboratorIds.length < 2 ? [...f.collaboratorIds, id] : f.collaboratorIds,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      router.push(`/bureau/projets/${data.project.id}`)
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  const displayName = (u: User) => u.pseudo || u.name || u.email

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>Nouveau projet</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}

        <div><label style={labelStyle}>Nom du projet *</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>

        <div><label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div><label style={labelStyle}>TJM (€/jour)</label>
          <input style={inputStyle} type="number" min="0" step="1" value={form.tjm} onChange={e => setForm(f => ({ ...f, tjm: e.target.value }))} placeholder="0" />
        </div>

        <div><label style={labelStyle}>Client *</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required>
            <option value="" style={{ background: '#111' }}>— Sélectionner un client —</option>
            {clients.map(c => <option key={c.id} value={c.id} style={{ background: '#111' }}>{displayName(c)}</option>)}
          </select>
        </div>

        {collabs.length > 0 && (
          <div>
            <label style={labelStyle}>Collaborateurs (max 2)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {collabs.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={form.collaboratorIds.includes(c.id)} onChange={() => toggleCollab(c.id)}
                    disabled={!form.collaboratorIds.includes(c.id) && form.collaboratorIds.length >= 2} />
                  {displayName(c)}
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" onClick={() => router.back()} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.6)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
          <button type="submit" disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Création...' : 'Créer le projet'}
          </button>
        </div>
      </form>
    </div>
  )
}
