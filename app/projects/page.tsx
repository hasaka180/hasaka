import ProjectGrid from '@/components/ProjectGrid'

export const metadata = { title: 'Projects — Hasaka' }

export default function ProjectsPage() {
  return (
    <div className="pi">
      <div className="phd">
        <h1>Projects</h1>
        <span className="al">All &nbsp;→</span>
      </div>
      <ProjectGrid />
    </div>
  )
}
