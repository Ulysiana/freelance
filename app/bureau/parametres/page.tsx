'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Settings, Save } from 'lucide-react'

export default function ParametresPage() {
  const [hoursPerDay, setHoursPerDay] = useState<number>(8)
  const [input, setInput] = useState('8')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      setHoursPerDay(d.hoursPerDay)
      setInput(String(d.hoursPerDay))
      setLoading(false)
    })
  }, [])

  async function save() {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0 || val > 24) return
    setSaving(true)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hoursPerDay: val }),
    })
    const data = await res.json()
    setHoursPerDay(data.hoursPerDay)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const secondsPerDay = hoursPerDay * 3600
  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '8px 12px', color: '#f0ebe4', fontSize: 14,
    outline: 'none', width: 80,
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        <Link href="/bureau" style={{ color: 'inherit', textDecoration: 'none' }}>Tableau de bord</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span style={{ color: '#f0ebe4' }}>Paramètres</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <Settings size={22} strokeWidth={1.8} style={{ color: '#e8946a' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Paramètres</h1>
      </div>

      {loading ? (
        <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#f0ebe4' }}>Suivi du temps</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.7)', marginBottom: 6 }}>Heures par jour (TJM)</div>
              <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>
                Utilisé pour calculer les coûts et afficher les jours dans le suivi du temps.
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <input
                type="number" min={1} max={24} step={0.5}
                value={input}
                onChange={e => setInput(e.target.value)}
                style={inputStyle}
              />
              <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.5)' }}>h/j</span>
            </div>
          </div>

          <div style={{ padding: '10px 12px', background: 'rgba(232,148,106,0.06)', border: '1px solid rgba(232,148,106,0.15)', borderRadius: 8, fontSize: 12, color: 'rgba(240,235,228,0.5)', marginBottom: 20 }}>
            1 journée = <strong style={{ color: '#e8946a' }}>{input || hoursPerDay}h</strong> soit{' '}
            <strong style={{ color: 'rgba(240,235,228,0.7)' }}>{Math.round(parseFloat(input || String(hoursPerDay)) * 3600)} s</strong>
          </div>

          <button onClick={save} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none', background: saved ? 'rgba(134,239,172,0.15)' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: saved ? '#86efac' : '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <Save size={14} strokeWidth={2} />
            {saving ? 'Enregistrement...' : saved ? 'Enregistré ✓' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}
