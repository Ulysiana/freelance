'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronRight, Type, Tag, AlignLeft, CheckSquare, MessageSquare, Save, Trash2, Circle, Loader2, CheckCircle2, BadgeCheck, LinkIcon, Paperclip, ExternalLink, X } from 'lucide-react'

const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false })
const TaskChecklist = dynamic(() => import('@/components/admin/TaskChecklist'), { ssr: false })
const Chronometer = dynamic(() => import('@/components/admin/Chronometer'), { ssr: false })
const TaskComments = dynamic(() => import('@/components/admin/TaskComments'), { ssr: false })
const TaskResources = dynamic(() => import('@/components/admin/TaskResources'), { ssr: false })

type Task = { id: string; title: string; description: string | null; status: string; phase: { id: string; name: string; project: { id: string; name: string; tjm: number } } }
type TaskLink = { id: string; url: string; title: string | null; addedBy: { name: string | null; pseudo: string | null } }

const editableStatusOptions = [
  { value: 'TODO',        label: 'À faire',  color: 'rgba(240,235,228,0.35)', Icon: Circle },
  { value: 'IN_PROGRESS', label: 'En cours', color: '#fbbf24',               Icon: Loader2 },
  { value: 'DONE',        label: 'Fait',     color: '#86efac',               Icon: CheckCircle2 },
]

const validatedStatusOption = { value: 'VALIDATED', label: 'Validé', color: '#e8946a', Icon: BadgeCheck }

const SectionLabel = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
    <Icon size={13} strokeWidth={1.8} style={{ color: 'rgba(240,235,228,0.35)' }} />
    <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{label}</span>
  </div>
)

export default function TaskDetailPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('TODO')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState('')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [links, setLinks] = useState<TaskLink[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [addingLink, setAddingLink] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/tasks/${taskId}`).then(r => r.json()).then(d => {
      setTask(d.task)
      setTitle(d.task.title)
      setDescription(d.task.description || '')
      setStatus(d.task.status)
      setAdminUnlocked(false)
    })
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      setCurrentUserId(d.user?.id || '')
      setCurrentUserRole(d.user?.role || '')
    })
    loadLinks()
  }, [taskId])

  async function loadLinks() {
    const res = await fetch(`/api/admin/tasks/${taskId}/links`)
    const data = await res.json()
    setLinks(data.links || [])
  }

  async function addLink() {
    if (!newUrl.trim()) return
    setAddingLink(true)
    await fetch(`/api/admin/tasks/${taskId}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl, title: newTitle }),
    })
    setNewUrl('')
    setNewTitle('')
    setAddingLink(false)
    loadLinks()
  }

  async function deleteLink(linkId: string) {
    await fetch(`/api/admin/task-links/${linkId}`, { method: 'DELETE' })
    setLinks(l => l.filter(x => x.id !== linkId))
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/admin/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, status, adminUnlock: adminUnlocked }) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'Enregistrement impossible')
      setSaving(false)
      return
    }
    setStatus(data.task.status)
    setTask(t => t ? { ...t, status: data.task.status } : t)
    setAdminUnlocked(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette tâche ?')) return
    await fetch(`/api/admin/tasks/${taskId}`, { method: 'DELETE' })
    router.push(`/bureau/projets/${id}/taches`)
  }

  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 12px', color: '#f0ebe4', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }

  if (!task) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>

  const persistedLocked = task.status === 'DONE' || task.status === 'VALIDATED'
  const adminCanDirectlyEdit = currentUserRole === 'ADMIN' && task.status === 'DONE'
  const isLocked = persistedLocked && !adminUnlocked && !adminCanDirectlyEdit
  const saveDisabled = saving || (currentUserRole !== 'CLIENT' && status === 'VALIDATED')

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Header : breadcrumb + chrono compact */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(240,235,228,0.35)', flexWrap: 'wrap' }}>
          <Link href="/bureau/projets" style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Projets</Link>
          <ChevronRight size={12} strokeWidth={1.5} />
          <Link href={`/bureau/projets/${id}`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{task.phase.project.name}</Link>
          <ChevronRight size={12} strokeWidth={1.5} />
          <Link href={`/bureau/projets/${id}/taches`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{task.phase.name}</Link>
          <ChevronRight size={12} strokeWidth={1.5} />
          <span style={{ color: 'rgba(240,235,228,0.6)' }}>{title}</span>
        </div>
        <Chronometer compact taskId={taskId} tjm={task.phase.project.tjm} taskStatus={task.status} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <SectionLabel icon={Type} label="Titre" />
          <input style={{ ...inputStyle, fontSize: 18, fontWeight: 600, opacity: isLocked ? 0.65 : 1 }} value={title} onChange={e => setTitle(e.target.value)} readOnly={isLocked} />
        </div>

        <div>
          <SectionLabel icon={Tag} label="Statut" />
          {task.status === 'DONE' && (
            <p style={{ marginTop: 0, marginBottom: 10, fontSize: 12, color: 'rgba(240,235,228,0.38)' }}>
              Tâche terminée côté production. En attente de validation client.
            </p>
          )}
          {task.status === 'VALIDATED' && (
            <p style={{ marginTop: 0, marginBottom: 10, fontSize: 12, color: 'rgba(240,235,228,0.38)' }}>
              {currentUserRole === 'ADMIN' ? 'Tâche validée par le client. Coche la case ci-dessous pour modifier le statut.' : 'Tâche validée par le client. Seul un admin peut modifier le statut.'}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {editableStatusOptions.map(({ value, label, color, Icon }) => (
              <button key={value} onClick={() => setStatus(value)} disabled={isLocked}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: `1px solid ${color}44`, background: status === value ? `${color}18` : 'transparent', color: status === value ? color : 'rgba(240,235,228,0.4)', cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.45 : 1, fontSize: 12, transition: 'all 0.15s' }}>
                <Icon size={12} strokeWidth={1.8} />
                {label}
              </button>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: `1px solid ${validatedStatusOption.color}44`, background: status === 'VALIDATED' ? `${validatedStatusOption.color}18` : 'transparent', color: status === 'VALIDATED' ? validatedStatusOption.color : 'rgba(240,235,228,0.25)', fontSize: 12, cursor: 'default' }}>
              <validatedStatusOption.Icon size={12} strokeWidth={1.8} />
              {validatedStatusOption.label}
            </span>
          </div>
          {currentUserRole === 'ADMIN' && task.status === 'VALIDATED' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer', fontSize: 12, color: adminUnlocked ? '#e8946a' : 'rgba(240,235,228,0.4)', userSelect: 'none' }}>
              <input type="checkbox" checked={adminUnlocked} onChange={e => setAdminUnlocked(e.target.checked)} style={{ accentColor: '#e8946a', width: 14, height: 14, cursor: 'pointer' }} />
              Déverrouiller pour modifier le statut
            </label>
          )}
        </div>

        <div>
          <SectionLabel icon={AlignLeft} label="Description" />
          {isLocked ? (
            <div className="rich-content" style={{ padding: '10px 14px', minHeight: 120, fontSize: 14, color: '#f0ebe4', lineHeight: 1.7, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }} dangerouslySetInnerHTML={{ __html: description }} />
          ) : (
            <RichEditor value={description} onChange={setDescription} />
          )}
        </div>

        <div>
          <SectionLabel icon={CheckSquare} label="Checklist" />
          <TaskChecklist taskId={taskId} locked={isLocked} />
        </div>

        <div>
          <SectionLabel icon={LinkIcon} label="Liens" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {links.map(link => (
              <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
                <ExternalLink size={13} strokeWidth={1.8} style={{ color: '#7dd3fc', flexShrink: 0 }} />
                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, color: '#7dd3fc', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.title || link.url}
                </a>
                {link.title && <span style={{ fontSize: 11, color: 'rgba(240,235,228,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{link.url}</span>}
                <button onClick={() => deleteLink(link.id)} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', padding: 2, flexShrink: 0, display: 'flex' }}>
                  <X size={14} strokeWidth={1.8} />
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: links.length > 0 ? 4 : 0 }}>
              <input
                placeholder="https://…"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLink()}
                style={{ ...inputStyle, flex: 2, padding: '7px 10px', fontSize: 13 }}
              />
              <input
                placeholder="Titre (optionnel)"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLink()}
                style={{ ...inputStyle, flex: 1, padding: '7px 10px', fontSize: 13 }}
              />
              <button onClick={addLink} disabled={addingLink || !newUrl.trim()} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'rgba(125,211,252,0.12)', color: '#7dd3fc', cursor: newUrl.trim() ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600, flexShrink: 0, opacity: newUrl.trim() ? 1 : 0.45 }}>
                Ajouter
              </button>
            </div>
          </div>
        </div>

        <div>
          <SectionLabel icon={Paperclip} label="Documents liés" />
          <TaskResources taskId={taskId} projectId={task.phase.project.id} locked={isLocked} />
        </div>

        <div>
          <SectionLabel icon={MessageSquare} label="Commentaires" />
          {currentUserId && <TaskComments taskId={taskId} currentUserId={currentUserId} currentUserRole={currentUserRole} />}
        </div>

        <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
          <button onClick={handleSave} disabled={saveDisabled} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 8, border: 'none', background: saved ? 'rgba(134,239,172,0.15)' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: saved ? '#86efac' : '#fff', fontWeight: 700, cursor: saveDisabled ? 'not-allowed' : 'pointer', opacity: saveDisabled ? 0.55 : 1, fontSize: 13, transition: 'all 0.2s' }}>
            <Save size={13} strokeWidth={2} />
            {saved ? 'Enregistré' : saving ? '...' : 'Enregistrer'}
          </button>
          <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 8, background: 'none', border: '1px solid rgba(220,50,50,0.25)', color: 'rgba(248,113,113,0.7)', cursor: 'pointer', fontSize: 13, marginLeft: 'auto' }}>
            <Trash2 size={13} strokeWidth={1.8} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
