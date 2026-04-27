'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, MessageSquare, FileText, AlertCircle, ChevronRight, Sparkles, Clock, Receipt, Plus } from 'lucide-react'
import { currencySymbol, formatAmount } from '@/lib/currency'

type Task = { id: string; status: string }
type Phase = { tasks: Task[] }
type Project = {
  id: string; name: string; status: string; updatedAt: string; tjm: number
  totalSeconds: number; estimatedCost: number | null
  phases: Phase[]
  messages: { id: string; content: string; createdAt: string; author: { name: string | null; pseudo: string | null; role: string } }[]
  documents: { id: string; title: string; updatedAt: string }[]
  requests: { id: string; title: string; status: string; updatedAt: string }[]
}
type RecentMessage = { id: string; content: string; createdAt: string; author: { name: string | null; pseudo: string | null; role: string }; project: { id: string; name: string } }
type RecentRequest = { id: string; title: string; status: string; updatedAt: string; project: { id: string; name: string } }
type RecentDoc = { id: string; title: string; updatedAt: string; project: { id: string; name: string } }
type InvoicePending = { id: string; number: string; amount: number; currency: string | null; dueAt: string | null }

type DashboardData = {
  currency: string
  projects: Project[]
  recentMessages: RecentMessage[]
  recentRequests: RecentRequest[]
  recentDocs: RecentDoc[]
  invoicesPending: InvoicePending[]
}

const requestStatusLabel: Record<string, string> = { PENDING: 'En attente', ACCEPTED: 'Acceptée', REFUSED: 'Refusée', QUOTED: 'Devis à venir' }
const requestStatusColor: Record<string, string> = { PENDING: 'rgba(240,235,228,0.4)', ACCEPTED: '#86efac', REFUSED: '#f87171', QUOTED: '#e8946a' }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l\'instant'
  if (m < 60) return `il y a ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

function formatTime(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

function ProjectCard({ project, currency }: { project: Project; currency: string }) {
  const allTasks = project.phases.flatMap(p => p.tasks)
  const total = allTasks.length
  const done = allTasks.filter(t => t.status === 'DONE' || t.status === 'VALIDATED').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const newMessages = project.messages.filter(m => m.author.role !== 'CLIENT').length

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/client/projets/${project.id}`} style={{ fontSize: 15, fontWeight: 700, color: '#f0ebe4', textDecoration: 'none' }}>
            {project.name}
          </Link>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', marginTop: 2 }}>
            Modifié {timeAgo(project.updatedAt)}
          </div>
        </div>
        {newMessages > 0 && (
          <Link href={`/client/projets/${project.id}/messages`} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: 'rgba(232,148,106,0.12)', border: '1px solid rgba(232,148,106,0.25)', color: '#e8946a', fontSize: 11, textDecoration: 'none', flexShrink: 0 }}>
            <MessageSquare size={10} strokeWidth={2} />
            {newMessages} nouveau{newMessages > 1 ? 'x' : ''}
          </Link>
        )}
      </div>

      {total > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)' }}>Avancement</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: pct === 100 ? '#86efac' : '#e8946a' }}>{pct}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', borderRadius: 2, background: pct === 100 ? '#86efac' : 'linear-gradient(90deg, #e8946a, #c27b5b)', width: `${pct}%`, transition: 'width 0.5s' }} />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 4 }}>{done}/{total} tâches</div>
        </div>
      )}

      {/* Temps + coût */}
      {project.totalSeconds > 0 && (
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(240,235,228,0.45)' }}>
            <Clock size={11} strokeWidth={1.8} style={{ color: '#7dd3fc' }} />
            {formatTime(project.totalSeconds)} investies
          </div>
          {project.estimatedCost !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(240,235,228,0.45)' }}>
              <span style={{ color: '#86efac', fontSize: 11, fontWeight: 700 }}>{currencySymbol(currency)}</span>
              {formatAmount(project.estimatedCost, currency, 0)}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link href={`/client/projets/${project.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.55)', fontSize: 12, textDecoration: 'none' }}>
          <FolderKanban size={11} strokeWidth={1.8} /> Suivi
        </Link>
        <Link href={`/client/projets/${project.id}/messages`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.55)', fontSize: 12, textDecoration: 'none' }}>
          <MessageSquare size={11} strokeWidth={1.8} /> Messages
        </Link>
        <Link href={`/client/projets/${project.id}/documents`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.55)', fontSize: 12, textDecoration: 'none' }}>
          <FileText size={11} strokeWidth={1.8} /> Docs
        </Link>
        <Link href={`/client/projets/${project.id}/demandes`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>
          <Plus size={11} strokeWidth={2.5} /> Demande
        </Link>
      </div>
    </div>
  )
}

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/client/dashboard')
      .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(`${r.status}: ${t.slice(0, 200)}`) }))
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  if (error) return (
    <div style={{ padding: 40 }}>
      <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'monospace' }}>{error}</p>
    </div>
  )

  if (!data) return (
    <div style={{ padding: 40 }}>
      <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
    </div>
  )

  const { currency, projects, recentMessages, recentRequests, recentDocs, invoicesPending } = data
  const hasNews = recentMessages.length > 0 || recentRequests.length > 0 || recentDocs.length > 0

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Mon espace</h1>
        <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Factures en attente */}
      {invoicesPending.length > 0 && (
        <Link href="/client/compte" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', marginBottom: 24 }}>
          <Receipt size={16} strokeWidth={1.8} style={{ color: '#f87171', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>
              {invoicesPending.length} facture{invoicesPending.length > 1 ? 's' : ''} en attente de règlement
            </div>
            <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', marginTop: 1 }}>
              {invoicesPending.map(i => `${i.number} — ${formatAmount(i.amount, i.currency || currency, 0)}`).join(' · ')}
            </div>
          </div>
          <ChevronRight size={14} strokeWidth={1.5} style={{ color: '#f87171', flexShrink: 0 }} />
        </Link>
      )}

      {/* Accès rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 32 }}>
        {[
          { href: '/client/projets', icon: <FolderKanban size={18} strokeWidth={1.6} />, label: 'Projets', color: '#e8946a' },
          { href: '/client/compte', icon: <Receipt size={18} strokeWidth={1.6} />, label: 'Factures', color: '#86efac' },
          { href: '/client/compte', icon: <FileText size={18} strokeWidth={1.6} />, label: 'Contrats', color: '#7dd3fc' },
          { href: '/client/securite', icon: <MessageSquare size={18} strokeWidth={1.6} />, label: 'Sécurité', color: 'rgba(240,235,228,0.4)' },
        ].map(({ href, icon, label, color }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color, transition: 'border-color 0.15s' }}>
            {icon}
            <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', fontWeight: 500 }}>{label}</span>
          </Link>
        ))}
      </div>

      {/* Nouveautés */}
      {hasNews && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sparkles size={14} strokeWidth={1.8} style={{ color: '#e8946a' }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e8946a' }}>Nouveautés cette semaine</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentMessages.map(m => (
              <Link key={m.id} href={`/client/projets/${m.project.id}/messages`} style={{ textDecoration: 'none', display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(232,148,106,0.05)', border: '1px solid rgba(232,148,106,0.12)', alignItems: 'center' }}>
                <MessageSquare size={13} strokeWidth={1.8} style={{ color: '#e8946a', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.5)', marginBottom: 1 }}>
                    <strong style={{ color: '#e8946a' }}>{m.author.pseudo || m.author.name}</strong> · {m.project.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.content}</div>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)', flexShrink: 0 }}>{timeAgo(m.createdAt)}</span>
              </Link>
            ))}
            {recentRequests.map(r => (
              <Link key={r.id} href={`/client/projets/${r.project.id}/demandes`} style={{ textDecoration: 'none', display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
                <AlertCircle size={13} strokeWidth={1.8} style={{ color: requestStatusColor[r.status], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', marginBottom: 1 }}>Demande · {r.project.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                </div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: requestStatusColor[r.status] + '18', color: requestStatusColor[r.status], flexShrink: 0 }}>{requestStatusLabel[r.status]}</span>
              </Link>
            ))}
            {recentDocs.map(d => (
              <Link key={d.id} href={`/client/projets/${d.project.id}/documents/${d.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
                <FileText size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', marginBottom: 1 }}>Document · {d.project.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)', flexShrink: 0 }}>{timeAgo(d.updatedAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>Mes projets</h2>
          <Link href="/client/projets" style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            Voir tous <ChevronRight size={12} strokeWidth={1.5} />
          </Link>
        </div>
        {projects.length === 0 ? (
          <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)' }}>Aucun projet en cours.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: projects.length === 1 ? '1fr' : '1fr 1fr', gap: 12 }}>
            {projects.map(p => <ProjectCard key={p.id} project={p} currency={currency} />)}
          </div>
        )}
      </div>
    </div>
  )
}
