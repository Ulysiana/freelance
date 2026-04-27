'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, User, FolderKanban, FileText, Receipt, Upload, Eye, Download, Trash2, Plus, Check, X } from 'lucide-react'
import { currencySymbol, formatAmount } from '@/lib/currency'

type Client = { id: string; name: string | null; email: string; phone: string | null; company: string | null; address: string | null; createdAt: string; billingCurrency: string | null }
type Project = { id: string; name: string; status: string; updatedAt: string }
type Contract = { id: string; originalName: string; mimeType: string; size: number; label: string | null; uploadedAt: string; uploadedBy: { name: string | null; pseudo: string | null } }
type Invoice = { id: string; number: string; amount: number; currency: string | null; status: string; issuedAt: string; dueAt: string | null; filename: string | null; originalName: string | null }

type Tab = 'infos' | 'projets' | 'contrats' | 'factures'

const invoiceStatusColor: Record<string, string> = { PENDING: '#e8946a', PAID: '#86efac', OVERDUE: '#f87171', CANCELLED: 'rgba(240,235,228,0.3)' }
const projectStatusLabel: Record<string, string> = { DRAFT: 'Brouillon', ACTIVE: 'Actif', COMPLETED: 'Terminé', ARCHIVED: 'Archivé' }
const projectStatusColor: Record<string, string> = { DRAFT: 'rgba(240,235,228,0.3)', ACTIVE: '#86efac', COMPLETED: '#7dd3fc', ARCHIVED: 'rgba(240,235,228,0.2)' }

function formatSize(b: number) {
  if (b < 1024) return `${b} o`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`
  return `${(b / 1024 / 1024).toFixed(1)} Mo`
}

export default function ClientFichePage() {
  const { clientId } = useParams<{ clientId: string }>()
  const [tab, setTab] = useState<Tab>('infos')
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [currency, setCurrency] = useState('EUR')
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [contractLabel, setContractLabel] = useState('')
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [invNumber, setInvNumber] = useState('')
  const [invAmount, setInvAmount] = useState('')
  const [invIssuedAt, setInvIssuedAt] = useState(new Date().toISOString().slice(0, 10))
  const [invDueAt, setInvDueAt] = useState('')
  const [invFile, setInvFile] = useState<File | null>(null)
  const [invLoading, setInvLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const invFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${clientId}`).then(r => r.json()),
      fetch(`/api/admin/projects?clientId=${clientId}`).then(r => r.json()),
      fetch(`/api/admin/clients/${clientId}/contracts`).then(r => r.json()),
      fetch(`/api/admin/clients/${clientId}/invoices`).then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
    ]).then(([u, p, c, i, s]) => {
      setClient(u.user)
      setProjects(p.projects || [])
      setContracts(c.contracts || [])
      setInvoices(i.invoices || [])
      setCurrency(u.user?.billingCurrency || s.currency || 'EUR')
    })
  }, [clientId])

  async function saveCurrency(nextCurrency: string) {
    setSavingCurrency(true)
    const res = await fetch(`/api/admin/users/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingCurrency: nextCurrency }),
    })
    const data = await res.json()
    if (res.ok && data.user) {
      setClient((prev) => (prev ? { ...prev, billingCurrency: data.user.billingCurrency } : prev))
      setCurrency(data.user.billingCurrency || nextCurrency)
    }
    setSavingCurrency(false)
  }

  async function uploadContract(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (contractLabel.trim()) fd.append('label', contractLabel.trim())
    const res = await fetch(`/api/admin/clients/${clientId}/contracts`, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.contract) setContracts(c => [data.contract, ...c])
    setUploading(false)
    setContractLabel('')
  }

  async function deleteContract(id: string) {
    if (!confirm('Supprimer ce document ?')) return
    setContracts(c => c.filter(x => x.id !== id))
    await fetch(`/api/admin/client-files/${id}`, { method: 'DELETE' })
  }

  async function openContract(id: string, download = false) {
    const res = await fetch(`/api/admin/client-files/${id}${download ? '?download=1' : ''}`)
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  async function createInvoice() {
    if (!invNumber || !invAmount) return
    setInvLoading(true)
    const fd = new FormData()
    fd.append('number', invNumber)
    fd.append('amount', invAmount)
    fd.append('issuedAt', invIssuedAt)
    if (invDueAt) fd.append('dueAt', invDueAt)
    if (invFile) fd.append('file', invFile)
    const res = await fetch(`/api/admin/clients/${clientId}/invoices`, { method: 'POST', body: fd })
    const data = await res.json()
    if (data.invoice) setInvoices(i => [data.invoice, ...i])
    setInvLoading(false)
    setShowInvoiceForm(false)
    setInvNumber(''); setInvAmount(''); setInvDueAt(''); setInvFile(null)
  }

  async function updateInvoiceStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/invoices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    const data = await res.json()
    if (data.invoice) setInvoices(inv => inv.map(i => i.id === id ? data.invoice : i))
  }

  async function deleteInvoice(id: string) {
    if (!confirm('Supprimer cette facture ?')) return
    setInvoices(i => i.filter(x => x.id !== id))
    await fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' })
  }

  async function openInvoice(id: string, download = false) {
    const res = await fetch(`/api/admin/invoices/${id}${download ? '?download=1' : ''}`)
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  const tabStyle = (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 7,
    fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', border: 'none',
    background: active ? 'rgba(232,148,106,0.12)' : 'transparent',
    color: active ? '#e8946a' : 'rgba(240,235,228,0.45)',
  })

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '9px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none',
  }

  if (!client) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>
        <Link href="/bureau/users" style={{ color: 'inherit', textDecoration: 'none' }}>Utilisateurs</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.6)' }}>{client.name || client.email}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(232,148,106,0.15)', border: '1px solid rgba(232,148,106,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={20} strokeWidth={1.5} style={{ color: '#e8946a' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{client.name || '—'}</h1>
          <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', marginTop: 2 }}>{client.email} {client.company && `· ${client.company}`}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 9, width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
        <button style={tabStyle(tab === 'infos')} onClick={() => setTab('infos')}><User size={13} strokeWidth={1.8} /> Infos</button>
        <button style={tabStyle(tab === 'projets')} onClick={() => setTab('projets')}><FolderKanban size={13} strokeWidth={1.8} /> Projets ({projects.length})</button>
        <button style={tabStyle(tab === 'contrats')} onClick={() => setTab('contrats')}><FileText size={13} strokeWidth={1.8} /> Contrats ({contracts.length})</button>
        <button style={tabStyle(tab === 'factures')} onClick={() => setTab('factures')}>
          <Receipt size={13} strokeWidth={1.8} /> Factures ({invoices.length})
          {invoices.filter(i => i.status === 'PENDING').length > 0 && (
            <span style={{ fontSize: 10, background: 'rgba(232,148,106,0.2)', color: '#e8946a', borderRadius: 999, padding: '1px 6px' }}>
              {invoices.filter(i => i.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* INFOS */}
        {tab === 'infos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Nom', value: client.name },
              { label: 'Email', value: client.email },
              { label: 'Téléphone', value: client.phone },
              { label: 'Entreprise', value: client.company },
              { label: 'Client depuis', value: new Date(client.createdAt).toLocaleDateString('fr-FR') },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, color: value ? '#f0ebe4' : 'rgba(240,235,228,0.25)' }}>{value || '—'}</div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Devise</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  value={currency}
                  onChange={e => { setCurrency(e.target.value); void saveCurrency(e.target.value) }}
                  disabled={savingCurrency}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 10px', color: '#f0ebe4', fontSize: 13 }}
                >
                  <option value="EUR" style={{ background: '#111' }}>EUR (€)</option>
                  <option value="USD" style={{ background: '#111' }}>USD ($)</option>
                  <option value="GBP" style={{ background: '#111' }}>GBP (£)</option>
                </select>
                <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>{savingCurrency ? 'Enregistrement...' : 'Utilisée pour les factures et les projets de ce client'}</span>
              </div>
            </div>
            {client.address && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Adresse</div>
                <div style={{ fontSize: 14, color: '#f0ebe4', whiteSpace: 'pre-line' }}>{client.address}</div>
              </div>
            )}
          </div>
        )}

        {/* PROJETS */}
        {tab === 'projets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projects.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)', margin: 0 }}>Aucun projet.</p>
            ) : projects.map(p => (
              <Link key={p.id} href={`/bureau/projets/${p.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <FolderKanban size={15} strokeWidth={1.5} style={{ color: 'rgba(232,148,106,0.5)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>Modifié le {new Date(p.updatedAt).toLocaleDateString('fr-FR')}</div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: projectStatusColor[p.status] + '18', color: projectStatusColor[p.status] }}>
                  {projectStatusLabel[p.status] || p.status}
                </span>
                <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.2)' }} />
              </Link>
            ))}
          </div>
        )}

        {/* CONTRATS */}
        {tab === 'contrats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Upload zone */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={contractLabel} onChange={e => setContractLabel(e.target.value)} placeholder="Libellé (ex: Devis n°42)" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: uploading ? 0.6 : 1, flexShrink: 0 }}>
                <Upload size={13} strokeWidth={2} /> {uploading ? 'Envoi...' : 'Uploader'}
              </button>
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadContract(f); e.target.value = '' }} />
            </div>

            {contracts.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)', margin: 0 }}>Aucun document.</p>
            ) : contracts.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <FileText size={15} strokeWidth={1.5} style={{ color: 'rgba(232,148,106,0.5)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label || c.originalName}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>{formatSize(c.size)} · {new Date(c.uploadedAt).toLocaleDateString('fr-FR')}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openContract(c.id)} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer' }}><Eye size={13} strokeWidth={1.8} /></button>
                  <button onClick={() => openContract(c.id, true)} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer' }}><Download size={13} strokeWidth={1.8} /></button>
                  <button onClick={() => deleteContract(c.id)} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer' }}><Trash2 size={13} strokeWidth={1.8} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FACTURES */}
        {tab === 'factures' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Bouton nouvelle facture */}
            {!showInvoiceForm && (
              <button onClick={() => setShowInvoiceForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', width: 'fit-content' }}>
                <Plus size={14} strokeWidth={2.5} /> Nouvelle facture
              </button>
            )}

            {/* Formulaire nouvelle facture */}
            {showInvoiceForm && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 4 }}>N° facture *</label>
                    <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} value={invNumber} onChange={e => setInvNumber(e.target.value)} placeholder="2024-001" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 4 }}>
                      Montant TTC ({currencySymbol(currency)}) *
                    </label>
                    <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} placeholder="1200" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 4 }}>Date d&apos;émission *</label>
                    <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} type="date" value={invIssuedAt} onChange={e => setInvIssuedAt(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 4 }}>Échéance</label>
                    <input style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} type="date" value={invDueAt} onChange={e => setInvDueAt(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', display: 'block', marginBottom: 4 }}>PDF (optionnel)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => invFileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 12 }}>
                      <Upload size={12} strokeWidth={2} /> Choisir un fichier
                    </button>
                    {invFile && <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>{invFile.name}</span>}
                    <input ref={invFileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setInvFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={createInvoice} disabled={invLoading || !invNumber || !invAmount}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: (!invNumber || !invAmount) ? 0.5 : 1 }}>
                    <Check size={13} strokeWidth={2.5} /> {invLoading ? 'Enregistrement...' : 'Créer'}
                  </button>
                  <button onClick={() => setShowInvoiceForm(false)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer', fontSize: 13 }}>
                    <X size={13} strokeWidth={2} /> Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste factures */}
            {invoices.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)', margin: 0 }}>Aucune facture.</p>
            ) : invoices.map(inv => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Receipt size={15} strokeWidth={1.5} style={{ color: 'rgba(232,148,106,0.5)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ebe4' }}>Facture {inv.number}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>
                    {new Date(inv.issuedAt).toLocaleDateString('fr-FR')}
                    {inv.dueAt && ` · échéance ${new Date(inv.dueAt).toLocaleDateString('fr-FR')}`}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>
                  {formatAmount(inv.amount, inv.currency || currency, 0)}
                </div>
                {/* Statut cliquable */}
                <select value={inv.status} onChange={e => updateInvoiceStatus(inv.id, e.target.value)}
                  style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, border: `1px solid ${invoiceStatusColor[inv.status]}33`, background: invoiceStatusColor[inv.status] + '15', color: invoiceStatusColor[inv.status], cursor: 'pointer', outline: 'none' }}>
                  <option value="PENDING">En attente</option>
                  <option value="PAID">Payée</option>
                  <option value="OVERDUE">En retard</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
                <div style={{ display: 'flex', gap: 4 }}>
                  {inv.filename && <>
                    <button onClick={() => openInvoice(inv.id)} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer' }}><Eye size={13} strokeWidth={1.8} /></button>
                    <button onClick={() => openInvoice(inv.id, true)} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(240,235,228,0.5)', cursor: 'pointer' }}><Download size={13} strokeWidth={1.8} /></button>
                  </>}
                  <button onClick={() => deleteInvoice(inv.id)} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer' }}><Trash2 size={13} strokeWidth={1.8} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
