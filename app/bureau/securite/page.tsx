'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react'
import Image from 'next/image'

export default function SecuritePage() {
  const [me, setMe] = useState<{ totpEnabled: boolean } | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let ignore = false
    fetch('/api/admin/me').then(r => r.json()).then(d => { if (!ignore) setMe(d.user) })
    return () => { ignore = true }
  }, [])

  async function startSetup() {
    setError('')
    setSuccess('')
    const res = await fetch('/api/auth/2fa/setup')
    const data = await res.json()
    setQr(data.qrDataUrl)
    setSecret(data.secret)
  }

  async function verifyAndEnable() {
    if (code.length !== 6) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/2fa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setSuccess('Double authentification activée !')
    setMe(m => m ? { ...m, totpEnabled: true } : m)
    setQr(null)
    setCode('')
  }

  async function disable() {
    if (!confirm('Désactiver la double authentification ?')) return
    await fetch('/api/auth/2fa/setup', { method: 'DELETE' })
    setMe(m => m ? { ...m, totpEnabled: false } : m)
    setSuccess('Double authentification désactivée.')
    setQr(null)
  }

  function copySecret() {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!me) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        <Link href="/bureau" style={{ color: 'inherit', textDecoration: 'none' }}>Tableau de bord</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span style={{ color: '#f0ebe4' }}>Sécurité</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Double authentification (2FA)</h1>

      {success && (
        <div style={{ background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.2)', color: '#86efac', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
          {success}
        </div>
      )}

      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {me.totpEnabled
            ? <ShieldCheck size={22} strokeWidth={1.5} style={{ color: '#86efac' }} />
            : <ShieldOff size={22} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.3)' }} />}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{me.totpEnabled ? 'Activée' : 'Non activée'}</div>
            <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', marginTop: 1 }}>
              {me.totpEnabled ? 'Votre compte est protégé par un code à usage unique.' : 'Ajoutez une couche de sécurité supplémentaire.'}
            </div>
          </div>
        </div>

        {!me.totpEnabled && !qr && (
          <button onClick={startSetup} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Configurer la 2FA
          </button>
        )}

        {me.totpEnabled && (
          <button onClick={disable} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.3)', background: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer' }}>
            Désactiver
          </button>
        )}
      </div>

      {qr && !me.totpEnabled && (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.6)', lineHeight: 1.6, margin: 0 }}>
            Scannez ce QR code avec <strong style={{ color: '#f0ebe4' }}>Google Authenticator</strong>, <strong style={{ color: '#f0ebe4' }}>Authy</strong> ou toute autre application TOTP.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', background: '#fff', borderRadius: 10, padding: 12, width: 'fit-content' }}>
            <img src={qr} alt="QR code 2FA" style={{ width: 180, height: 180 }} />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <code style={{ flex: 1, fontSize: 12, color: 'rgba(240,235,228,0.5)', letterSpacing: '0.1em', wordBreak: 'break-all' }}>{secret}</code>
            <button onClick={copySecret} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#86efac' : 'rgba(240,235,228,0.4)', flexShrink: 0 }}>
              {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.8} />}
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Code de vérification</label>
            <input
              type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', color: '#f0ebe4', fontSize: 22, fontWeight: 700, outline: 'none', textAlign: 'center', letterSpacing: '0.3em' }}
            />
            <button onClick={verifyAndEnable} disabled={loading || code.length !== 6}
              style={{ padding: '11px', borderRadius: 8, border: 'none', background: code.length === 6 ? 'linear-gradient(135deg, #e8946a, #c27b5b)' : 'rgba(255,255,255,0.05)', color: code.length === 6 ? '#fff' : 'rgba(240,235,228,0.3)', fontWeight: 700, fontSize: 13, cursor: code.length === 6 ? 'pointer' : 'default' }}>
              {loading ? 'Vérification...' : 'Activer la 2FA'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
