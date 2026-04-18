'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/bureau'
  const reset = searchParams.get('reset') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur de connexion'); return }
      if (data.requiresOtp) {
        router.push(`/login/otp?role=${data.role}`)
        return
      }
      const role = data.user?.role
      if (role === 'CLIENT') router.push('/client')
      else router.push(from)
      router.refresh()
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {reset && (
        <div style={{ background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.22)', color: '#86efac', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
          Mot de passe mis à jour. Tu peux te reconnecter.
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)} required
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f0ebe4', fontSize: 14, outline: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mot de passe</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)} required
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f0ebe4', fontSize: 14, outline: 'none' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/mot-de-passe-oublie" style={{ fontSize: 12, color: '#e8946a', textDecoration: 'none' }}>
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
      <button
        type="submit" disabled={loading}
        style={{ marginTop: 8, padding: '12px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)', marginTop: 8 }}>Espace privé</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px' }}>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
