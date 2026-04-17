'use client'

import { useEffect, useState } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookies_accepted')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookies_accepted', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, right: 20, maxWidth: 520, margin: '0 auto', background: 'rgba(18,14,10,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, zIndex: 9999, backdropFilter: 'blur(10px)' }}>
      <p style={{ flex: 1, fontSize: 13, color: 'rgba(240,235,228,0.6)', margin: 0, lineHeight: 1.5 }}>
        Ce site utilise des cookies de session pour votre authentification.{' '}
        <a href="/politique-confidentialite" style={{ color: '#e8946a', textDecoration: 'underline' }}>En savoir plus</a>
      </p>
      <button onClick={accept}
        style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Accepter
      </button>
    </div>
  )
}
