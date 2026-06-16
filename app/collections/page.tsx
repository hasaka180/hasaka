import CaseCollectionGrid from '@/components/CaseCollectionGrid'

export const metadata = { title: 'Case Studies — Hasaka' }

export default function CollectionsPage() {
  return (
    <div className="pi">
      <div className="phd">
        <h1>Case Studies</h1>
      </div>
      <CaseCollectionGrid />
    </div>
  )
}
