'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Kanban, Clock, MessageCirclePlus, FileText, Globe, MessageSquare, ChevronRight } from 'lucide-react'
import { useIsMobile } from '@/lib/useIsMobile'

type Project = {
  id: string; name: string; description: string | null; status: string
  billingType: string; tjm: number; forfaitAmount: number | null; createdAt: string
  client: { id: string; name: string | null; pseudo: string | null; email: string }
  collaborators: { collaborator: { id: string; name: string | null; pseudo: string | null } }[]
  _count: { messages: number; documents: number; requests: number; phases: number; htmlPages: number }
  messages: { id: string; content: string; createdAt: string; author: { name: string | null; pseudo: string | null; role: string } }[]
  documents: { id: string; title: string; updatedAt: string }[]
  requests: { id: string; title: string; status: string; updatedAt: string }[]
  phases: { id: string; _count: { tasks: number }; tasks: { status: string }[] }[]
}

function SectionCard({ href, label, icon: Icon, count, children }: { href: string; label: string; icon: React.ElementType; count: number; children?: React.ReactNode }) {
  return (
    <Link href={href} style={{ display: 'block', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.7)', textDecoration: 'none', transition: 'border-color 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: children ? 10 : 0 }}>
        <Icon size={13} strokeWidth={1.8} />
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: count > 0 ? 'rgba(134,239,172,0.12)' : 'rgba(255,255,255,0.04)', color: count > 0 ? '#86efac' : 'rgba(240,235,228,0.25)', border: `1px solid ${count > 0 ? 'rgba(134,239,172,0.2)' : 'rgba(255,255,255,0.06)'}` }}>{count}</span>
      </div>
      {children && <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>}
    </Link>
  )
}

const statusLabel: Record<string, string> = { DRAFT: 'Brouillon', ACTIVE: 'Actif', ARCHIVED: 'Archivé' }
const statusColor: Record<string, string> = { DRAFT: 'rgba(240,235,228,0.4)', ACTIVE: '#86efac', ARCHIVED: 'rgba(240,235,228,0.2)' }

export default function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [currency, setCurrency] = useState('EUR')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', billingType: 'TJM', tjm: '', forfaitAmount: '', status: '' })
  const [saving, setSaving] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const isMobile = useIsMobile()

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/projects/${id}`).then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
      fetch(`/api/admin/projects/${id}/temps`).then(r => r.json()),
    ]).then(([d, s, t]) => {
      setProject(d.project)
      setForm({
        name: d.project.name,
        description: d.project.description || '',
        billingType: d.project.billingType || 'TJM',
        tjm: String(d.project.tjm),
        forfaitAmount: d.project.forfaitAmount ? String(d.project.forfaitAmount) : '',
        status: d.project.status,
      })
      setCurrency(s.currency || 'EUR')
      const tasks: { totalSeconds: number; cost: number }[] = t.tasks || []
      setTotalSeconds(tasks.reduce((a, x) => a + x.totalSeconds, 0))
      setTotalCost(tasks.reduce((a, x) => a + x.cost, 0))
      setLoading(false)
    })
  }, [id])

  async function handleSave() {
    setSaving(true)
    const body = {
      ...form,
      tjm: form.billingType === 'TJM' ? parseFloat(form.tjm) || 0 : 0,
      forfaitAmount: form.billingType === 'FORFAIT' ? parseFloat(form.forfaitAmount) || null : null,
    }
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setProject(data.project)
    setEditing(false)
    setSaving(false)
  }

  async function handleArchive() {
    if (!confirm('Archiver ce projet ?')) return
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
    router.push('/bureau/projets')
  }

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#f0ebe4', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }
  const currSymbol = { EUR: '€', USD: '$', GBP: '£' }[currency] ?? '€'

  function fmtSeconds(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h === 0) return `${m} min`
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  if (loading) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>
  if (!project) return <p style={{ color: '#f87171' }}>Projet introuvable.</p>

  const displayName = (u: { name: string | null; pseudo: string | null; email?: string }) => u.pseudo || u.name || u.email || '—'
  const isForfait = project.billingType === 'FORFAIT'

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: 'rgba(240,235,228,0.4)' }}>
        <Link href="/bureau/projets" style={{ color: 'inherit', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={14} strokeWidth={1.5} />
        <span style={{ color: '#f0ebe4' }}>{project.name}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        {editing ? (
          <input style={{ ...inputStyle, fontSize: 22, fontWeight: 700, flex: 1 }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        ) : (
          <h1 style={{ fontSize: 24, fontWeight: 700, flex: 1 }}>{project.name}</h1>
        )}
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.4)' }}>
          {isForfait ? 'Forfait' : 'TJM'}
        </span>
        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${statusColor[project.status]}44`, color: statusColor[project.status] }}>
          {statusLabel[project.status]}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Client</div>
          <div style={{ fontWeight: 600 }}>{displayName(project.client)}</div>
          <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)', marginTop: 2 }}>{project.client.email}</div>
        </div>

        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
          {editing ? (
            <>
              <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Facturation</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {['TJM', 'FORFAIT'].map(bt => (
                  <button key={bt} type="button" onClick={() => setForm(f => ({ ...f, billingType: bt }))}
                    style={{ flex: 1, padding: '6px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: form.billingType === bt ? '2px solid #e8946a' : '1px solid rgba(255,255,255,0.08)', background: form.billingType === bt ? 'rgba(232,148,106,0.08)' : 'transparent', color: form.billingType === bt ? '#e8946a' : 'rgba(240,235,228,0.5)' }}>
                    {bt}
                  </button>
                ))}
              </div>
              {form.billingType === 'TJM' && (
                <input style={inputStyle} type="number" value={form.tjm} onChange={e => setForm(f => ({ ...f, tjm: e.target.value }))} placeholder={`TJM (${currSymbol}/j)`} />
              )}
              {form.billingType === 'FORFAIT' && (
                <input style={inputStyle} type="number" value={form.forfaitAmount} onChange={e => setForm(f => ({ ...f, forfaitAmount: e.target.value }))} placeholder={`Forfait (${currSymbol})`} />
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {isForfait ? 'Prix forfaitaire' : 'TJM'}
              </div>
              {isForfait ? (
                <div style={{ fontSize: 20, fontWeight: 700, color: '#86efac' }}>
                  {project.forfaitAmount ? `${project.forfaitAmount.toLocaleString('fr-FR')} ${currSymbol}` : '—'}
                  <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(240,235,228,0.4)', marginLeft: 4 }}>forfait</span>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#e8946a' }}>
                    {project.tjm} {currSymbol}<span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(240,235,228,0.4)' }}>/jour</span>
                  </div>
                  {totalSeconds > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>
                        <span style={{ color: 'rgba(240,235,228,0.7)', fontWeight: 600 }}>{fmtSeconds(totalSeconds)}</span> passés
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>
                        <span style={{ color: '#86efac', fontWeight: 600 }}>{totalCost.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currSymbol}</span> cumulés
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Description</div>
        {editing ? (
          <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        ) : (
          <p style={{ fontSize: 14, color: 'rgba(240,235,228,0.6)', lineHeight: 1.7 }}>{project.description || <em style={{ opacity: 0.4 }}>Aucune description</em>}</p>
        )}
      </div>

      {editing && (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Statut</div>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v} style={{ background: '#111' }}>{l}</option>)}
          </select>
        </div>
      )}

      {project.collaborators.length > 0 && (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Collaborateurs</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {project.collaborators.map(({ collaborator: c }) => (
              <span key={c.id} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(125,211,252,0.08)', border: '1px solid rgba(125,211,252,0.2)', color: '#7dd3fc' }}>{displayName(c)}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
        {/* Phases & Tâches */}
        {(() => {
          const allTasks = (project.phases ?? []).flatMap(p => p.tasks)
          const done = allTasks.filter(t => t.status === 'DONE' || t.status === 'VALIDATED').length
          const total = allTasks.length
          const taskCount = total
          return (
            <SectionCard href={`/bureau/projets/${id}/taches`} label="Phases & Tâches" icon={Kanban} count={taskCount}>
              {taskCount > 0 && <div style={{ fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>{done}/{total} terminées · {project.phases.length} phase{project.phases.length > 1 ? 's' : ''}</div>}
            </SectionCard>
          )
        })()}
        {/* Messages */}
        <SectionCard href={`/bureau/projets/${id}/messages`} label="Messages" icon={MessageSquare} count={project._count?.messages ?? 0}>
          {project.messages.slice(0, 2).map(m => (
            <div key={m.id} style={{ fontSize: 12, color: 'rgba(240,235,228,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#e8946a', marginRight: 4 }}>{m.author.pseudo || m.author.name || '?'}</span>{m.content}
            </div>
          ))}
        </SectionCard>
        {/* Demandes */}
        <SectionCard href={`/bureau/projets/${id}/demandes`} label="Demandes" icon={MessageCirclePlus} count={project._count?.requests ?? 0}>
          {project.requests.slice(0, 2).map(r => (
            <div key={r.id} style={{ fontSize: 12, color: 'rgba(240,235,228,0.45)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.status === 'PENDING' ? '#e8946a' : r.status === 'ACCEPTED' ? '#86efac' : 'rgba(240,235,228,0.2)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
            </div>
          ))}
        </SectionCard>
        {/* Documents */}
        <SectionCard href={`/bureau/projets/${id}/documents`} label="Documents" icon={FileText} count={project._count?.documents ?? 0}>
          {project.documents.slice(0, 2).map(d => (
            <div key={d.id} style={{ fontSize: 12, color: 'rgba(240,235,228,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
          ))}
        </SectionCard>
        {/* Pages HTML */}
        <SectionCard href={`/bureau/projets/${id}/pages`} label="Pages HTML" icon={Globe} count={project._count?.htmlPages ?? 0} />
        {/* Suivi du temps */}
        {!isForfait && <SectionCard href={`/bureau/projets/${id}/temps`} label="Suivi du temps" icon={Clock} count={0} />}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {editing ? (
          <>
            <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.6)', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,235,228,0.7)', cursor: 'pointer', fontSize: 13 }}>Modifier</button>
            {project.status !== 'ARCHIVED' && (
              <button onClick={handleArchive} style={{ padding: '10px 20px', borderRadius: 8, background: 'none', border: '1px solid rgba(220,50,50,0.25)', color: 'rgba(248,113,113,0.7)', cursor: 'pointer', fontSize: 13 }}>Archiver</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
