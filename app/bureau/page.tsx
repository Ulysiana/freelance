'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, Users, Clock, MessageSquare, AlertCircle, TrendingUp, CheckCircle2, CircleDot, Circle, CheckSquare, ChevronDown, ChevronRight } from 'lucide-react'
import { useIsMobile } from '@/lib/useIsMobile'
import { formatAmount } from '@/lib/currency'

type ClientWithProjects = {
  id: string
  name: string | null
  pseudo: string | null
  email: string
  projectsAsClient: {
    id: string
    name: string
    status: string
    updatedAt: string
    _count: { messages: number; requests: number }
  }[]
}

type DashboardData = {
  defaultCurrency: string
  stats: {
    activeProjects: number
    totalProjects: number
    totalClients: number
    pendingRequests: number
    timeSecondsThisMonth: number
    revenueThisMonthByCurrency: Record<string, number>
  }
  tasksByStatus: Record<string, number>
  recentMessages: {
    id: string
    content: string
    createdAt: string
    author: { name: string | null; pseudo: string | null; role: string }
    project: { id: string; name: string }
  }[]
  recentRequests: {
    id: string
    title: string
    createdAt: string
    author: { name: string | null; pseudo: string | null }
    project: { id: string; name: string }
  }[]
  clientsWithProjects: ClientWithProjects[]
}

function formatSeconds(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h === 0 && m === 0) return `${s}s`
  if (h === 0) return `${m}m${String(s).padStart(2, '0')}s`
  return `${h}h${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l\'instant'
  if (m < 60) return `il y a ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  return `il y a ${Math.floor(h / 24)}j`
}

const taskStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  TODO:        { label: 'À faire',  color: 'rgba(240,235,228,0.35)', icon: Circle },
  IN_PROGRESS: { label: 'En cours', color: '#7dd3fc',                icon: CircleDot },
  DONE:        { label: 'Terminé',  color: '#86efac',                icon: CheckCircle2 },
  VALIDATED:   { label: 'Validé',   color: '#e8946a',                icon: CheckSquare },
}

const projectStatusColor: Record<string, string> = {
  DRAFT: 'rgba(240,235,228,0.35)',
  ACTIVE: '#86efac',
  ARCHIVED: 'rgba(240,235,228,0.2)',
}
const projectStatusLabel: Record<string, string> = {
  DRAFT: 'Brouillon', ACTIVE: 'Actif', ARCHIVED: 'Archivé',
}

function ClientCard({ client }: { client: ClientWithProjects }) {
  const [open, setOpen] = useState(true)
  const displayName = client.pseudo || client.name || client.email
  const activeCount = client.projectsAsClient.filter(p => p.status === 'ACTIVE').length

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'rgba(240,235,228,0.6)', flexShrink: 0 }}>
          {displayName[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ebe4' }}>{displayName}</div>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', marginTop: 1 }}>{client.email}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeCount > 0 && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.2)', color: '#86efac' }}>
              {activeCount} actif{activeCount > 1 ? 's' : ''}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)' }}>{client.projectsAsClient.length} projet{client.projectsAsClient.length > 1 ? 's' : ''}</span>
          {open ? <ChevronDown size={14} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.3)' }} /> : <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.3)' }} />}
        </div>
      </button>

      {open && client.projectsAsClient.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {client.projectsAsClient.map(p => (
            <Link key={p.id} href={`/bureau/projets/${p.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: projectStatusColor[p.status], flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'rgba(240,235,228,0.8)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ fontSize: 11, color: projectStatusColor[p.status], flexShrink: 0 }}>{projectStatusLabel[p.status]}</span>
              {p._count.messages > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'rgba(240,235,228,0.3)' }}>
                  <MessageSquare size={10} strokeWidth={1.5} />{p._count.messages}
                </span>
              )}
              {p._count.requests > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'rgba(248,113,113,0.5)' }}>
                  <AlertCircle size={10} strokeWidth={1.5} />{p._count.requests}
                </span>
              )}
              <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.2)', flexShrink: 0 }}>{timeAgo(p.updatedAt)}</span>
            </Link>
          ))}
        </div>
      )}

      {open && client.projectsAsClient.length === 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '14px 20px' }}>
          <p style={{ fontSize: 12, color: 'rgba(240,235,228,0.25)', margin: 0 }}>Aucun projet.</p>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [view, setView] = useState<'overview' | 'clients'>('overview')
  const [seenIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    const stored = JSON.parse(localStorage.getItem('seen_messages') || '[]') as string[]
    return new Set(stored)
  })
  const isMobile = useIsMobile()

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(setData)
  }, [])

  if (!data) return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Tableau de bord</h1>
      <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
    </div>
  )

  const { defaultCurrency, stats, tasksByStatus, recentRequests, clientsWithProjects } = data
  const recentMessages = data.recentMessages.filter(m => !seenIds.has(m.id))
  const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0)
  const revenueEntries = Object.entries(stats.revenueThisMonthByCurrency || {})
  const revenueValue =
    revenueEntries.length <= 1
      ? formatAmount(revenueEntries[0]?.[1] || 0, revenueEntries[0]?.[0] || defaultCurrency, 0)
      : `${revenueEntries.length} devises`
  const revenueSub =
    revenueEntries.length <= 1
      ? 'basé sur TJM'
      : revenueEntries.map(([currency, amount]) => formatAmount(amount, currency, 0)).join(' · ')

  const statCards = [
    { label: 'Projets actifs',    value: stats.activeProjects,    sub: `${stats.totalProjects} au total`,   icon: FolderKanban, color: '#7dd3fc' },
    { label: 'Clients',           value: stats.totalClients,      sub: 'comptes clients',                   icon: Users,        color: '#86efac' },
    { label: 'Temps ce mois',     value: formatSeconds(stats.timeSecondsThisMonth), sub: 'temps pointé',   icon: Clock,        color: '#e8946a' },
    { label: 'CA estimé ce mois', value: revenueValue, sub: revenueSub, icon: TrendingUp, color: '#c084fc' },
  ]

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0, justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Tableau de bord</h1>
          <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 13 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
          {(['overview', 'clients'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: view === v ? 'rgba(255,255,255,0.08)' : 'none', color: view === v ? '#f0ebe4' : 'rgba(240,235,228,0.4)', transition: 'all 0.15s' }}>
              {v === 'overview' ? 'Vue globale' : 'Par clients'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards — always visible */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 }}>{label}</div>
              <Icon size={16} strokeWidth={1.5} style={{ color, opacity: 0.7, flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {view === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Tasks by status */}
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Tâches</div>
              {totalTasks === 0 ? (
                <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)' }}>Aucune tâche.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(taskStatusConfig).map(([status, { label, color, icon: Icon }]) => {
                    const count = tasksByStatus[status] || 0
                    const pct = totalTasks ? Math.round((count / totalTasks) * 100) : 0
                    return (
                      <div key={status}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Icon size={13} strokeWidth={1.8} style={{ color }} />
                          <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.6)', flex: 1 }}>{label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color }}>{count}</span>
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: color, width: `${pct}%`, transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Pending requests */}
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Demandes en attente</div>
                {stats.pendingRequests > 0 && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                    {stats.pendingRequests}
                  </span>
                )}
              </div>
              {recentRequests.length === 0 ? (
                <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)' }}>Aucune demande en attente.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentRequests.map(r => (
                    <Link key={r.id} href={`/bureau/projets/${r.project.id}/demandes`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={12} strokeWidth={1.8} style={{ color: '#f87171', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#f0ebe4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', paddingLeft: 18 }}>
                        {r.project.name} · {r.author.pseudo || r.author.name} · {timeAgo(r.createdAt)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent messages */}
          <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MessageSquare size={14} strokeWidth={1.5} style={{ color: 'rgba(240,235,228,0.4)' }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>Derniers messages</div>
            </div>
            {recentMessages.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)' }}>Aucun message.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recentMessages.map(m => (
                  <Link key={m.id} href={`/bureau/projets/${m.project.id}/messages`} style={{ textDecoration: 'none', display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: m.author.role === 'ADMIN' ? 'rgba(232,148,106,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${m.author.role === 'ADMIN' ? 'rgba(232,148,106,0.3)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: m.author.role === 'ADMIN' ? '#e8946a' : 'rgba(240,235,228,0.5)' }}>
                      {(m.author.pseudo || m.author.name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: m.author.role === 'ADMIN' ? '#e8946a' : 'rgba(240,235,228,0.7)' }}>
                          {m.author.pseudo || m.author.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)' }}>{m.project.name}</span>
                        <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)', marginLeft: 'auto' }}>{timeAgo(m.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.content}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'clients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clientsWithProjects.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(240,235,228,0.3)' }}>Aucun client.</p>
          ) : (
            clientsWithProjects.map(client => <ClientCard key={client.id} client={client} />)
          )}
        </div>
      )}
    </div>
  )
}
