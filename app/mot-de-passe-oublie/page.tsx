'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Impossible d’envoyer l’email.')
        return
      }
      setDone(true)
    } catch {
      setError('Impossible d’envoyer l’email.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#f0ebe4',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)', marginTop: 8 }}>Réinitialiser le mot de passe</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px' }}>
          {done ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.22)', color: '#86efac', padding: '12px 14px', borderRadius: 8, fontSize: 13 }}>
                Si un compte existe avec cet email, le lien de réinitialisation vient d’être envoyé.
              </div>
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.45)', margin: 0 }}>
                Vérifie aussi le dossier spam. Le lien expire rapidement pour limiter les abus.
              </p>
              <Link href="/login" style={{ color: '#e8946a', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.45)', margin: 0 }}>
                Saisis ton email. Si un compte existe, on t’envoie un lien de réinitialisation.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ marginTop: 8, padding: '12px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              <Link href="/login" style={{ color: 'rgba(240,235,228,0.5)', fontSize: 13, textDecoration: 'none' }}>
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
