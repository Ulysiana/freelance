'use client'

import { useEffect, useState, useRef } from 'react'

type TodoItem = { id: string; label: string; checked: boolean; order: number }

export default function TaskChecklist({ taskId }: { taskId: string }) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch(`/api/admin/tasks/${taskId}/todos`)
    const data = await res.json()
    setTodos(data.todos || [])
  }

  useEffect(() => { load() }, [taskId])

  async function addTodo() {
    if (!newLabel.trim()) return
    setAdding(true)
    await fetch(`/api/admin/tasks/${taskId}/todos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newLabel }),
    })
    setNewLabel('')
    setAdding(false)
    load()
    inputRef.current?.focus()
  }

  async function toggle(id: string, checked: boolean) {
    setTodos(t => t.map(todo => todo.id === id ? { ...todo, checked } : todo))
    await fetch(`/api/admin/todos/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked }),
    })
  }

  async function remove(id: string) {
    setTodos(t => t.filter(todo => todo.id !== id))
    await fetch(`/api/admin/todos/${id}`, { method: 'DELETE' })
  }

  const done = todos.filter(t => t.checked).length
  const total = todos.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      {total > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(240,235,228,0.45)', marginBottom: 6 }}>
            <span>{done}/{total} complétés</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #e8946a, #c27b5b)', borderRadius: 999, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {todos.map(todo => (
          <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '1')}
            onMouseLeave={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement)?.style.setProperty('opacity', '0')}>
            <input type="checkbox" checked={todo.checked} onChange={e => toggle(todo.id, e.target.checked)}
              style={{ width: 15, height: 15, accentColor: '#e8946a', cursor: 'pointer', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: todo.checked ? 'rgba(240,235,228,0.35)' : 'rgba(240,235,228,0.8)', textDecoration: todo.checked ? 'line-through' : 'none', transition: 'all 0.2s' }}>
              {todo.label}
            </span>
            <button className="del-btn" onClick={() => remove(todo.id)}
              style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.6)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, opacity: 0, transition: 'opacity 0.15s' }}>×</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input ref={inputRef} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px', color: '#f0ebe4', fontSize: 13, outline: 'none' }}
          placeholder="Ajouter un élément..."
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()} />
        <button onClick={addTodo} disabled={adding || !newLabel.trim()}
          style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'rgba(232,148,106,0.12)', color: '#e8946a', cursor: 'pointer', fontSize: 12, opacity: !newLabel.trim() ? 0.4 : 1 }}>
          + Ajouter
        </button>
      </div>
    </div>
  )
}
