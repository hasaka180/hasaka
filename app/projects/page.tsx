import ProjectGrid from '@/components/ProjectGrid'
import { getItems, type CaseStudy } from '@/lib/cases'

export const metadata = { title: 'Projects — Hasaka' }
export const revalidate = 600 // ISR: cache for 10 min; builder writes revalidate instantly

export default async function ProjectsPage() {
  const items = (await getItems('work')) as CaseStudy[]
  return (
    <div className="pi">
      <div className="phd">
        <h1>Projects</h1>
        <span className="al">All &nbsp;→</span>
      </div>
      <ProjectGrid initialItems={items} />
    </div>
  )
}
