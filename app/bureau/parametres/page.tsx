'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Settings, Save } from 'lucide-react'

const CURRENCIES = [
  { value: 'EUR', label: 'Euro (€)', flag: '🇪🇺' },
  { value: 'USD', label: 'Dollar US ($)', flag: '🇺🇸' },
  { value: 'GBP', label: 'Livre sterling (£)', flag: '🇬🇧' },
]

export default function ParametresPage() {
  const [hoursPerDay, setHoursPerDay] = useState<number>(8)
  const [input, setInput] = useState('8')
  const [currency, setCurrency] = useState('EUR')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      setHoursPerDay(d.hoursPerDay)
      setInput(String(d.hoursPerDay))
      setCurrency(d.currency || 'EUR')
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
      body: JSON.stringify({ hoursPerDay: val, currency }),
    })
    const data = await res.json()
    setHoursPerDay(data.hoursPerDay)
    setCurrency(data.currency)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '8px 12px', color: '#f0ebe4', fontSize: 14,
    outline: 'none',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Devise */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#f0ebe4' }}>Devise de facturation</h2>
            <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)', marginBottom: 16 }}>Utilisée pour afficher tous les montants dans l'app.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {CURRENCIES.map(c => (
                <button key={c.value} onClick={() => setCurrency(c.value)}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    border: currency === c.value ? '2px solid #e8946a' : '1px solid rgba(255,255,255,0.08)',
                    background: currency === c.value ? 'rgba(232,148,106,0.1)' : 'rgba(255,255,255,0.02)',
                    color: currency === c.value ? '#e8946a' : 'rgba(240,235,228,0.5)',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{c.flag}</div>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heures par jour */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#f0ebe4' }}>Suivi du temps</h2>
            <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)', marginBottom: 16 }}>Définit la durée d'une journée pour le calcul du TJM.</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.6)' }}>Heures par jour</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" min={1} max={24} step={0.5} value={input} onChange={e => setInput(e.target.value)} style={{ ...inputStyle, width: 80 }} />
                <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.5)' }}>h/j</span>
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: 'rgba(232,148,106,0.06)', border: '1px solid rgba(232,148,106,0.15)', borderRadius: 8, fontSize: 12, color: 'rgba(240,235,228,0.5)', marginTop: 12 }}>
              1 journée = <strong style={{ color: '#e8946a' }}>{input || hoursPerDay}h</strong> = <strong style={{ color: 'rgba(240,235,228,0.7)' }}>{Math.round(parseFloat(input || String(hoursPerDay)) * 3600)} secondes</strong>
            </div>
          </div>

          <button onClick={save} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 8, border: 'none', background: saved ? 'rgba(134,239,172,0.15)' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: saved ? '#86efac' : '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', width: 'fit-content' }}>
            <Save size={14} strokeWidth={2} />
            {saving ? 'Enregistrement...' : saved ? 'Enregistré ✓' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}
