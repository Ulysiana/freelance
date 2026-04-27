'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

type ProjectSummary = {
  id: string
  name: string
  status: string
  billingType: string
  client: { name: string | null; pseudo: string | null; email: string }
  _count: { messages: number; documents: number; requests: number; htmlPages: number }
  phases: { tasks: { id: string }[] }[]
}

type NavTab = {
  href: string
  label: string
  match: (pathname: string) => boolean
  count?: number
}

const statusLabel: Record<string, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  ARCHIVED: 'Archivé',
}

export default function ProjectSectionNav() {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const [project, setProject] = useState<ProjectSummary | null>(null)

  useEffect(() => {
    fetch(`/api/admin/projects/${id}`)
      .then(r => r.json())
      .then(data => setProject(data.project || null))
  }, [id])

  const basePath = `/bureau/projets/${id}`
  const tasksCount = project?.phases?.reduce((total, phase) => total + phase.tasks.length, 0) ?? 0

  const primaryTabs = useMemo<NavTab[]>(() => ([
    { href: basePath, label: 'Aperçu', match: (current) => current === basePath },
    {
      href: `${basePath}/taches`,
      label: 'Travail',
      match: (current) => current.startsWith(`${basePath}/taches`) || current.startsWith(`${basePath}/temps`) || current.startsWith(`${basePath}/demandes`),
      count: tasksCount,
    },
    {
      href: `${basePath}/messages`,
      label: 'Échanges',
      match: (current) => current.startsWith(`${basePath}/messages`),
      count: project?._count.messages ?? 0,
    },
    {
      href: `${basePath}/documents`,
      label: 'Ressources',
      match: (current) => current.startsWith(`${basePath}/documents`) || current.startsWith(`${basePath}/pages`) || current.startsWith(`${basePath}/liens`),
      count: (project?._count.documents ?? 0) + (project?._count.htmlPages ?? 0),
    },
  ]), [basePath, project?._count.documents, project?._count.htmlPages, project?._count.messages, tasksCount])

  const activePrimary = primaryTabs.find(tab => tab.match(pathname))?.label

  const secondaryTabs = useMemo<NavTab[]>(() => {
    if (activePrimary === 'Travail') {
      return [
        { href: `${basePath}/taches`, label: 'Tâches', match: (current) => current.startsWith(`${basePath}/taches`), count: tasksCount },
        { href: `${basePath}/temps`, label: 'Temps', match: (current) => current.startsWith(`${basePath}/temps`) },
        { href: `${basePath}/demandes`, label: 'Demandes', match: (current) => current.startsWith(`${basePath}/demandes`), count: project?._count.requests ?? 0 },
      ]
    }
    if (activePrimary === 'Ressources') {
      return [
        { href: `${basePath}/documents`, label: 'Documents', match: (current) => current.startsWith(`${basePath}/documents`), count: project?._count.documents ?? 0 },
        { href: `${basePath}/pages`, label: 'Pages HTML', match: (current) => current.startsWith(`${basePath}/pages`), count: project?._count.htmlPages ?? 0 },
        { href: `${basePath}/liens`, label: 'Liens', match: (current) => current.startsWith(`${basePath}/liens`) },
      ]
    }
    return []
  }, [activePrimary, basePath, project?._count.documents, project?._count.htmlPages, project?._count.requests, tasksCount])

  const clientName = project ? (project.client.pseudo || project.client.name || project.client.email) : 'Projet'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(240,235,228,0.35)' }}>
        <Link href="/bureau/projets" style={{ color: 'inherit', textDecoration: 'none' }}>Projets</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span style={{ color: 'rgba(240,235,228,0.62)' }}>{project?.name || 'Chargement...'}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{project?.name || 'Projet'}</h1>
          {project && (
            <>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,235,228,0.55)' }}>
                {project.billingType === 'FORFAIT' ? 'Forfait' : 'TJM'}
              </span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(232,148,106,0.08)', border: '1px solid rgba(232,148,106,0.18)', color: '#e8946a' }}>
                {statusLabel[project.status] || project.status}
              </span>
            </>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(240,235,228,0.42)' }}>
          Client : <span style={{ color: 'rgba(240,235,228,0.72)' }}>{clientName}</span>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {primaryTabs.map(tab => {
            const active = tab.match(pathname)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  background: active ? 'rgba(232,148,106,0.14)' : 'rgba(255,255,255,0.03)',
                  border: active ? '1px solid rgba(232,148,106,0.26)' : '1px solid rgba(255,255,255,0.06)',
                  color: active ? '#e8946a' : 'rgba(240,235,228,0.55)',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                }}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: 999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 7px',
                    background: active ? 'rgba(232,148,106,0.18)' : 'rgba(255,255,255,0.06)',
                    color: active ? '#f6c4ad' : 'rgba(240,235,228,0.35)',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {tab.count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {secondaryTabs.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {secondaryTabs.map(tab => {
              const active = tab.match(pathname)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '7px 12px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: active ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
                    color: active ? '#f0ebe4' : 'rgba(240,235,228,0.4)',
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span style={{ color: active ? 'rgba(240,235,228,0.75)' : 'rgba(240,235,228,0.28)', fontSize: 11 }}>
                      {tab.count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
