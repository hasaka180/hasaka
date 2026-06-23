import JournalGrid from '@/components/JournalGrid'
import { getItems, type JournalPost } from '@/lib/cases'

export const metadata = {
  title: 'Journal — Hasaka Wijenarayana',
  description: 'Essays, process notes and interviews on brand strategy, design systems, generative AI and creative craft.',
}
export const revalidate = 600

export default async function JournalPage() {
  const items = (await getItems('journal')) as JournalPost[]
  return (
    <div className="pi">
      <div className="phd">
        <h1>Journal</h1>
        <span className="al">Latest &nbsp;→</span>
      </div>
      <JournalGrid initialItems={items} />
    </div>
  )
}
