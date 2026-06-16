import CaseGrid from '@/components/CaseGrid'

export const metadata = { title: 'Cases — Hasaka' }

export default function CasesPage() {
  return (
    <div className="pi">
      <div className="phd">
        <h1>Cases</h1>
        <span className="al">All &nbsp;→</span>
      </div>
      <CaseGrid />
    </div>
  )
}
