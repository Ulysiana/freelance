'use client'

import { useEffect, useState, useRef } from 'react'
import { User, FileText, Receipt, Shield, Save, Eye, Download, ChevronRight, Upload, Check } from 'lucide-react'
import Link from 'next/link'

type Profile = { id: string; name: string | null; email: string; phone: string | null; company: string | null; address: string | null }
type Contract = { id: string; originalName: string; mimeType: string; size: number; label: string | null; uploadedAt: string; uploadedBy: { name: string | null; pseudo: string | null } }
type Invoice = { id: string; number: string; amount: number; status: string; issuedAt: string; dueAt: string | null; filename: string | null }

const invoiceStatusLabel: Record<string, string> = { PENDING: 'En attente', PAID: 'Payée', OVERDUE: 'En retard', CANCELLED: 'Annulée' }
const invoiceStatusColor: Record<string, string> = { PENDING: '#e8946a', PAID: '#86efac', OVERDUE: '#f87171', CANCELLED: 'rgba(240,235,228,0.3)' }

function formatSize(b: number) {
  if (b < 1024) return `${b} o`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`
  return `${(b / 1024 / 1024).toFixed(1)} Mo`
}

type Tab = 'profil' | 'contrats' | 'factures' | 'securite'

export default function ComptePage() {
  const [tab, setTab] = useState<Tab>('profil')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/client/profile').then(r => r.json()),
      fetch('/api/client/contracts').then(r => r.json()),
      fetch('/api/client/invoices').then(r => r.json()),
    ]).then(([p, c, i]) => {
      setProfile(p.profile)
      setContracts(c.contracts || [])
      setInvoices(i.invoices || [])
    })
  }, [])

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    const res = await fetch('/api/client/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profile.name, phone: profile.phone, company: profile.company, address: profile.address }),
    })
    const data = await res.json()
    setProfile(data.profile)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function openContract(id: string, download = false) {
    const res = await fetch(`/api/admin/client-files/${id}${download ? '?download=1' : ''}`)
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  async function openInvoice(id: string, download = false) {
    const res = await fetch(`/api/admin/invoices/${id}${download ? '?download=1' : ''}`)
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  const tabStyle = (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left' as const,
    background: active ? 'rgba(232,148,106,0.12)' : 'transparent',
    color: active ? '#e8946a' : 'rgba(240,235,228,0.5)',
    transition: 'all 0.15s',
  })

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '10px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Mon compte</h1>
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.35)' }}>Gérez vos informations et documents</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          <button style={tabStyle(tab === 'profil')} onClick={() => setTab('profil')}>
            <User size={14} strokeWidth={1.8} /> Profil
          </button>
          <button style={tabStyle(tab === 'contrats')} onClick={() => setTab('contrats')}>
            <FileText size={14} strokeWidth={1.8} /> Contrats
            {contracts.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(255,255,255,0.08)', borderRadius: 999, padding: '1px 7px' }}>{contracts.length}</span>}
          </button>
          <button style={tabStyle(tab === 'factures')} onClick={() => setTab('factures')}>
            <Receipt size={14} strokeWidth={1.8} /> Factures
            {invoices.filter(i => i.status === 'PENDING').length > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(232,148,106,0.2)', color: '#e8946a', borderRadius: 999, padding: '1px 7px' }}>
                {invoices.filter(i => i.status === 'PENDING').length}
              </span>
            )}
          </button>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <Link href="/client/securite" style={{ ...tabStyle(tab === 'securite'), textDecoration: 'none' }}>
            <Shield size={14} strokeWidth={1.8} /> Sécurité
          </Link>
        </div>

        {/* Contenu */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>

          {tab === 'profil' && profile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Informations personnelles</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 6 }}>Nom complet</label>
                  <input style={inputStyle} value={profile.name || ''} onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : p)} placeholder="Votre nom" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 6 }}>Email</label>
                  <input style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} value={profile.email} readOnly />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 6 }}>Téléphone</label>
                  <input style={inputStyle} value={profile.phone || ''} onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : p)} placeholder="+33 6 00 00 00 00" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 6 }}>Entreprise</label>
                  <input style={inputStyle} value={profile.company || ''} onChange={e => setProfile(p => p ? { ...p, company: e.target.value } : p)} placeholder="Nom de votre entreprise" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 6 }}>Adresse</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={profile.address || ''} onChange={e => setProfile(p => p ? { ...p, address: e.target.value } : p)} placeholder="Votre adresse complète" />
              </div>

              <button onClick={saveProfile} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 8, border: 'none', background: saved ? '#86efac' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: saved ? '#1a1714' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, width: 'fit-content', transition: 'background 0.2s' }}>
                {saved ? <><Check size={14} strokeWidth={2.5} /> Enregistré</> : <><Save size={14} strokeWidth={2} /> Enregistrer</>}
              </button>
            </div>
          )}

          {tab === 'contrats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Contrats & documents</h2>
              {contracts.length === 0 ? (
                <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)' }}>Aucun document disponible pour l'instant.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {contracts.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <FileText size={16} strokeWidth={1.5} style={{ color: 'rgba(232,148,106,0.6)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.label || c.originalName}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>
                          {formatSize(c.size)} · {new Date(c.uploadedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => openContract(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12 }}>
                          <Eye size={13} strokeWidth={1.8} />
                        </button>
                        <button onClick={() => openContract(c.id, true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12 }}>
                          <Download size={13} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'factures' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Mes factures</h2>
              {invoices.length === 0 ? (
                <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)' }}>Aucune facture pour l'instant.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {invoices.map(inv => (
                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Receipt size={16} strokeWidth={1.5} style={{ color: 'rgba(232,148,106,0.6)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>Facture {inv.number}</div>
                        <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>
                          Émise le {new Date(inv.issuedAt).toLocaleDateString('fr-FR')}
                          {inv.dueAt && ` · Échéance ${new Date(inv.dueAt).toLocaleDateString('fr-FR')}`}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4', marginRight: 8 }}>
                        {inv.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: invoiceStatusColor[inv.status] + '20', color: invoiceStatusColor[inv.status], fontWeight: 600, flexShrink: 0 }}>
                        {invoiceStatusLabel[inv.status]}
                      </span>
                      {inv.filename && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => openInvoice(inv.id)} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer' }}>
                            <Eye size={13} strokeWidth={1.8} />
                          </button>
                          <button onClick={() => openInvoice(inv.id, true)} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer' }}>
                            <Download size={13} strokeWidth={1.8} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
