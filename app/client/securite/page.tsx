'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Copy, Check, X } from 'lucide-react'

export default function ClientSecuritePage() {
  const router = useRouter()
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let ignore = false
    fetch('/api/auth/2fa/setup').then(r => r.json()).then(d => {
      if (!ignore) { setQr(d.qrDataUrl); setSecret(d.secret) }
    })
    return () => { ignore = true }
  }, [])

  async function verify() {
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
    router.push('/client')
    router.refresh()
  }

  function copySecret() {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0806', color: '#f0ebe4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e8946a' }}>Creahub<span style={{ color: 'rgba(232,148,106,0.5)', fontWeight: 400 }}> Solutions</span></span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldCheck size={24} strokeWidth={1.5} style={{ color: '#e8946a', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Double authentification (2FA)</div>
                <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.45)', marginTop: 2, lineHeight: 1.5 }}>
                  Recommandé pour sécuriser votre compte. Vous pouvez l'activer maintenant ou plus tard.
                </div>
              </div>
            </div>
            <button onClick={() => router.push('/client')}
              style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.3)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
              title="Configurer plus tard">
              <X size={16} strokeWidth={1.8} />
            </button>
          </div>

          {qr && (
            <>
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.55)', margin: 0, lineHeight: 1.6 }}>
                1. Installez <strong style={{ color: '#f0ebe4' }}>Google Authenticator</strong> ou <strong style={{ color: '#f0ebe4' }}>Authy</strong> sur votre téléphone.<br />
                2. Scannez ce QR code.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', background: '#fff', borderRadius: 10, padding: 12, width: 'fit-content', alignSelf: 'center' }}>
                <img src={qr} alt="QR code 2FA" style={{ width: 160, height: 160 }} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', flex: 1, wordBreak: 'break-all', letterSpacing: '0.05em' }}>{secret}</span>
                <button onClick={copySecret} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#86efac' : 'rgba(240,235,228,0.35)', flexShrink: 0 }}>
                  {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.8} />}
                </button>
              </div>
            </>
          )}

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
            <button onClick={verify} disabled={loading || code.length !== 6}
              style={{ padding: '12px', borderRadius: 999, border: 'none', background: code.length === 6 ? 'linear-gradient(135deg, #e8946a, #c27b5b)' : 'rgba(255,255,255,0.05)', color: code.length === 6 ? '#fff' : 'rgba(240,235,228,0.3)', fontWeight: 700, fontSize: 14, cursor: code.length === 6 ? 'pointer' : 'default' }}>
              {loading ? 'Vérification...' : 'Activer le 2FA'}
            </button>
            <button onClick={() => router.push('/client')}
              style={{ padding: '10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.4)', fontSize: 13, cursor: 'pointer' }}>
              Configurer plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
