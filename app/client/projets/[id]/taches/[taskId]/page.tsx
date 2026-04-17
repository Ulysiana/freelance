'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const TaskComments = dynamic(() => import('@/components/admin/TaskComments'), { ssr: false })

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
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUserRole, setCurrentUserRole] = useState('')

  useEffect(() => {
    fetch(`/api/admin/tasks/${taskId}`).then(r => r.json()).then(d => setTask(d.task))
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      setCurrentUserId(d.user?.id || '')
      setCurrentUserRole(d.user?.role || '')
    })
  }, [taskId])

  if (!task) return <p style={{ color: 'rgba(240,235,228,0.4)', fontSize: 14 }}>Chargement...</p>

  const status = statusConfig[task.status] || statusConfig.TODO
  const done = task.todos.filter(t => t.checked).length
  const total = task.todos.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push(`/client/projets/${id}`)} style={{ background: 'none', border: 'none', color: 'rgba(240,235,228,0.4)', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
        <span style={{ fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>{task.phase.project.name} › {task.phase.name}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f0ebe4', margin: 0, flex: 1 }}>{task.title}</h1>
        <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: `${status.color}18`, color: status.color, border: `1px solid ${status.color}44` }}>
          {status.label}
        </span>
      </div>

      {task.description && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Description</label>
          <div style={{ fontSize: 13, color: 'rgba(240,235,228,0.75)', lineHeight: 1.7, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}
            dangerouslySetInnerHTML={{ __html: task.description }} />
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

      <div>
        <label style={{ fontSize: 11, color: 'rgba(240,235,228,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Commentaires</label>
        {currentUserId && <TaskComments taskId={taskId} currentUserId={currentUserId} currentUserRole={currentUserRole} />}
      </div>
    </div>
  )
}
