import ProjectSectionNav from '@/components/admin/ProjectSectionNav'

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ProjectSectionNav />
      {children}
    </div>
  )
}
