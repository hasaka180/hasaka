import CaseCollectionGrid from '@/components/CaseCollectionGrid'
import { getItems, type CaseStudy } from '@/lib/cases'

export const metadata = { title: 'Case Studies — Hasaka' }
export const revalidate = 600

export default async function CollectionsPage() {
  const items = (await getItems('case')) as CaseStudy[]
  return (
    <div className="pi">
      <div className="phd">
        <h1>Case Studies</h1>
      </div>
      <CaseCollectionGrid initialItems={items} />
    </div>
  )
}
