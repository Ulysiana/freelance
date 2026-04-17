'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const roleLabel: Record<string, string> = { CLIENT: 'client', ADMIN: 'administrateur', COLLABORATEUR: 'collaborateur' }

export default function RejoindPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [inv, setInv] = useState<{ role: string; email: string | null } | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/auth/invitations/${token}`).then(r => {
      if (!r.ok) { setInvalid(true); return null }
      return r.json()
    }).then(d => {
      if (!d) return
      setInv(d)
      if (d.email) setForm(f => ({ ...f, email: d.email }))
    })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch(`/api/auth/invitations/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    if (data.user.role === 'CLIENT') router.push('/client')
    else router.push('/bureau')
    router.refresh()
  }

  const input: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f0ebe4', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', color: '#f0ebe4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
        </div>

        {invalid ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px', textAlign: 'center' }}>
            <p style={{ color: '#f87171', marginBottom: 8 }}>Ce lien est invalide ou a déjà été utilisé.</p>
            <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>Contactez l'administrateur pour obtenir un nouveau lien.</p>
          </div>
        ) : inv ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px' }}>
            <div style={{ marginBottom: 24, padding: '10px 14px', borderRadius: 8, background: 'rgba(232,148,106,0.06)', border: '1px solid rgba(232,148,106,0.15)' }}>
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.6)', margin: 0 }}>
                Vous avez été invité(e) en tant que <strong style={{ color: '#e8946a' }}>{roleLabel[inv.role] || inv.role}</strong>.
              </p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nom (optionnel)</label>
                <input style={input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Votre nom" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
                <input style={input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required readOnly={!!inv.email} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mot de passe</label>
                <input style={input} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} placeholder="8 caractères minimum" />
              </div>
              <button type="submit" disabled={loading}
                style={{ marginTop: 4, padding: '12px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Création...' : 'Créer mon compte →'}
              </button>
            </form>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
        )}
      </div>
    </div>
  )
}
