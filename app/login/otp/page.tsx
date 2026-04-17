'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'

function OtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/2fa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.replace(/\s/g, '') }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Code invalide'); setLoading(false); return }
      if (data.role === 'CLIENT') router.push('/client')
      else router.push('/bureau')
      router.refresh()
    } catch {
      setError('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <ShieldCheck size={32} strokeWidth={1.5} style={{ color: '#e8946a' }} />
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.5)', textAlign: 'center', lineHeight: 1.5 }}>
          Saisissez le code à 6 chiffres affiché dans votre application d'authentification.
        </p>
      </div>
      {error && (
        <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
        placeholder="000000"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px', color: '#f0ebe4', fontSize: 28, fontWeight: 700, outline: 'none', textAlign: 'center', letterSpacing: '0.3em' }}
      />
      <button
        type="submit" disabled={loading || code.length !== 6}
        style={{ padding: '12px', borderRadius: 999, border: 'none', background: code.length === 6 ? 'linear-gradient(135deg, #e8946a, #c27b5b)' : 'rgba(255,255,255,0.05)', color: code.length === 6 ? '#fff' : 'rgba(240,235,228,0.3)', fontSize: 14, fontWeight: 700, cursor: code.length === 6 ? 'pointer' : 'default' }}>
        {loading ? 'Vérification...' : 'Confirmer'}
      </button>
      <button type="button" onClick={() => router.push('/login')}
        style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.35)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
        ← Retour à la connexion
      </button>
    </form>
  )
}

export default function OtpPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)', marginTop: 8 }}>Double authentification</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px' }}>
          <Suspense fallback={null}>
            <OtpForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
