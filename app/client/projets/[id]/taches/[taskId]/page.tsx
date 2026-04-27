'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import { linkifyHtmlContent } from '@/lib/richText'

const TaskComments = dynamic(() => import('@/components/admin/TaskComments'), { ssr: false })
const AttachmentUploader = dynamic(() => import('@/components/admin/AttachmentUploader'), { ssr: false })

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  phase: { name: string; project: { name: string } }
  todos: { id: string; label: string; checked: boolean }[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  TODO:        { label: 'À faire',  color: 'rgba(240,235,228,0.35)' },
  IN_PROGRESS: { label: 'En cours', color: '#fbbf24' },
  DONE:        { label: 'Fait',     color: '#86efac' },
  VALIDATED:   { label: 'Validé',   color: '#e8946a' },
}

export default function ClientTaskPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState('')
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/tasks/${taskId}`).then(r => r.json()).then(d => setTask(d.task))
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      setCurrentUserId(d.user?.id || '')
      setCurrentUserRole(d.user?.role || '')
    })
  }, [taskId])

  async function validateTask() {
    setValidating(true)
    const res = await fetch(`/api/admin/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'VALIDATED' }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data.error || 'Validation impossible')
      setValidating(false)
      return
    }
    setTask(data.task)
    setValidating(false)
  }

  if (!task) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>

  const status = statusConfig[task.status] || statusConfig.TODO
  const done = task.todos.filter(t => t.checked).length
  const total = task.todos.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href={`/client/projets/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(240,235,228,0.4)', textDecoration: 'none' }}>
          <ChevronLeft size={13} strokeWidth={1.8} /> Suivi
        </Link>
        <div style={{ fontSize: 11, color: 'rgba(240,235,228,0.3)', marginTop: 2 }}>{task.phase.name}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4', margin: 0, flex: 1 }}>{task.title}</h1>
        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: `${status.color}18`, color: status.color, border: `1px solid ${status.color}44` }}>
          {status.label}
        </span>
      </div>

      {task.status === 'DONE' && (
        <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 10, background: 'rgba(232,148,106,0.08)', border: '1px solid rgba(232,148,106,0.18)' }}>
          <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.78)', marginBottom: 10 }}>
            Cette tâche est marquée comme terminée. Tu peux maintenant la valider.
          </div>
          <button onClick={validateTask} disabled={validating}
            style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8946a, #c27b5b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: validating ? 0.7 : 1 }}>
            {validating ? 'Validation...' : 'Valider la tâche'}
          </button>
        </div>
      )}

      {task.status === 'VALIDATED' && (
        <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 10, background: 'rgba(134,239,172,0.08)', border: '1px solid rgba(134,239,172,0.18)', fontSize: 13, color: 'rgba(240,235,228,0.75)' }}>
          Tâche validée. Le temps associé est désormais verrouillé.
        </div>
      )}

      {task.description && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Description</label>
          <div className="rich-content" style={{ fontSize: 13, color: 'rgba(240,235,228,0.75)', lineHeight: 1.7, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}
            dangerouslySetInnerHTML={{ __html: linkifyHtmlContent(task.description) }} />
        </div>
      )}

      {total > 0 && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Checklist</label>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(240,235,228,0.4)', marginBottom: 6 }}>
              <span>{done}/{total} complétés</span><span>{pct}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #e8946a, #c27b5b)', borderRadius: 999, transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {task.todos.map(todo => (
              <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${todo.checked ? '#e8946a' : 'rgba(255,255,255,0.2)'}`, background: todo.checked ? 'rgba(232,148,106,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {todo.checked && <span style={{ fontSize: 9, color: '#e8946a' }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: todo.checked ? 'rgba(240,235,228,0.3)' : 'rgba(240,235,228,0.75)', textDecoration: todo.checked ? 'line-through' : 'none' }}>{todo.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Pièces jointes</label>
        <AttachmentUploader taskId={taskId} isAdmin={false} />
      </div>

      <div>
        <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Commentaires</label>
        {currentUserId && <TaskComments taskId={taskId} currentUserId={currentUserId} currentUserRole={currentUserRole} />}
      </div>
    </div>
  )
}
