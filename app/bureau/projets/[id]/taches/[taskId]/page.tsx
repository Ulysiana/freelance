'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChevronRight, Type, Tag, AlignLeft, CheckSquare, Clock, MessageSquare, Paperclip, Save, Trash2, Circle, Loader2, CheckCircle2, BadgeCheck } from 'lucide-react'

const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false })
const TaskChecklist = dynamic(() => import('@/components/admin/TaskChecklist'), { ssr: false })
const Chronometer = dynamic(() => import('@/components/admin/Chronometer'), { ssr: false })
const TaskComments = dynamic(() => import('@/components/admin/TaskComments'), { ssr: false })
const AttachmentUploader = dynamic(() => import('@/components/admin/AttachmentUploader'), { ssr: false })

type Task = { id: string; title: string; description: string | null; status: string; phase: { id: string; name: string; project: { id: string; name: string; tjm: number } } }

const statusOptions = [
  { value: 'TODO',        label: 'À faire',  color: 'rgba(240,235,228,0.35)', Icon: Circle },
  { value: 'IN_PROGRESS', label: 'En cours', color: '#fbbf24',               Icon: Loader2 },
  { value: 'DONE',        label: 'Fait',     color: '#86efac',               Icon: CheckCircle2 },
  { value: 'VALIDATED',   label: 'Validé',   color: '#e8946a',               Icon: BadgeCheck },
]

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

  useEffect(() => {
    fetch(`/api/admin/tasks/${taskId}`).then(r => r.json()).then(d => {
      setTask(d.task)
      setTitle(d.task.title)
      setDescription(d.task.description || '')
      setStatus(d.task.status)
    })
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      setCurrentUserId(d.user?.id || '')
      setCurrentUserRole(d.user?.role || '')
    })
  }, [taskId])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/admin/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, status }) })
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

  return (
    <div style={{ maxWidth: 720 }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'rgba(240,235,228,0.35)', flexWrap: 'wrap' }}>
        <Link href="/bureau/projets" style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/bureau/projets/${id}`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{task.phase.project.name}</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href={`/bureau/projets/${id}/taches`} style={{ color: 'rgba(240,235,228,0.35)', textDecoration: 'none' }}>{task.phase.name}</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.6)' }}>{title}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
        <div>
          <SectionLabel icon={Type} label="Titre" />
          <input style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }} value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <SectionLabel icon={Tag} label="Statut" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statusOptions.map(({ value, label, color, Icon }) => (
              <button key={value} onClick={() => setStatus(value)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: `1px solid ${color}44`, background: status === value ? `${color}18` : 'transparent', color: status === value ? color : 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 12, transition: 'all 0.15s' }}>
                <Icon size={12} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel icon={AlignLeft} label="Description" />
          <RichEditor value={description} onChange={setDescription} />
        </div>

        <div>
          <SectionLabel icon={CheckSquare} label="Checklist" />
          <TaskChecklist taskId={taskId} />
        </div>

        <div>
          <SectionLabel icon={Clock} label="Temps passé" />
          <Chronometer taskId={taskId} tjm={task.phase.project.tjm} />
        </div>

        <div>
          <SectionLabel icon={Paperclip} label="Pièces jointes" />
          <AttachmentUploader taskId={taskId} isAdmin={currentUserRole === 'ADMIN'} />
        </div>

        <div>
          <SectionLabel icon={MessageSquare} label="Commentaires" />
          {currentUserId && <TaskComments taskId={taskId} currentUserId={currentUserId} currentUserRole={currentUserRole} />}
        </div>

        <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 8, border: 'none', background: saved ? 'rgba(134,239,172,0.15)' : 'linear-gradient(135deg, #e8946a, #c27b5b)', color: saved ? '#86efac' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' }}>
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
