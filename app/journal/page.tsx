import JournalGrid from '@/components/JournalGrid'

export const metadata = { title: 'Journal — Hasaka' }

export default function JournalPage() {
  return (
    <div className="pi">
      <div className="phd">
        <h1>Journal</h1>
        <span className="al">Latest &nbsp;→</span>
      </div>
      <JournalGrid />
    </div>
  )
}
