'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { passwordStrength } from '@/lib/password'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [loadingToken, setLoadingToken] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/auth/password-reset/${token}`).then(async (response) => {
      if (!response.ok) {
        setInvalid(true)
        setLoadingToken(false)
        return
      }

      const data = await response.json()
      setEmail(data.email || '')
      setLoadingToken(false)
    }).catch(() => {
      setInvalid(true)
      setLoadingToken(false)
    })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/auth/password-reset/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Impossible de mettre à jour le mot de passe.')
        return
      }
      router.push('/login?reset=1')
      router.refresh()
    } catch {
      setError('Impossible de mettre à jour le mot de passe.')
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
    width: '100%',
    boxSizing: 'border-box',
  }

  if (loadingToken) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Vérification du lien...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)', marginTop: 8 }}>Choisir un nouveau mot de passe</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px' }}>
          {invalid ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '12px 14px', borderRadius: 8, fontSize: 13 }}>
                Ce lien est invalide ou expiré.
              </div>
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.45)', margin: 0 }}>
                Redemande un lien depuis l’écran “mot de passe oublié”.
              </p>
              <Link href="/mot-de-passe-oublie" style={{ color: '#e8946a', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                Demander un nouveau lien
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && (
                <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  {error}
                </div>
              )}
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.45)', margin: 0 }}>
                Compte concerné : <strong style={{ color: '#f0ebe4' }}>{email}</strong>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nouveau mot de passe</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="10 car. min, maj, chiffre, symbole"
                />
                {password.length > 0 && (() => {
                  const strength = passwordStrength(password)
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: strength.color }}>{strength.label}</span>
                    </div>
                  )
                })()}
                <p style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', margin: 0 }}>10 caractères min. · 1 majuscule · 1 chiffre · 1 caractère spécial</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confirmer le mot de passe</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ marginTop: 8, padding: '12px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
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
