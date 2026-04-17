'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'

export default function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const btn = (active: boolean): React.CSSProperties => ({
    padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12,
    background: active ? 'rgba(232,148,106,0.2)' : 'rgba(255,255,255,0.05)',
    color: active ? '#e8946a' : 'rgba(240,235,228,0.6)',
  })

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
      {editor && (
        <div style={{ display: 'flex', gap: 4, padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btn(editor.isActive('bold'))}><b>B</b></button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btn(editor.isActive('italic'))}><i>I</i></button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={btn(editor.isActive('underline'))}><u>S</u></button>
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btn(editor.isActive('bulletList'))}>• Liste</button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btn(editor.isActive('orderedList'))}>1. Liste</button>
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={btn(editor.isActive('codeBlock'))}>{'</>'}</button>
        </div>
      )}
      <EditorContent editor={editor} style={{ padding: '10px 14px', minHeight: 120, fontSize: 14, color: '#f0ebe4', lineHeight: 1.7 }} />
    </div>
  )
}
