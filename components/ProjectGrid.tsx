'use client'

import { useEffect, useState } from 'react'
import CaseStudyModal from './CaseStudyModal'
import type { CaseStudy } from '@/lib/cases'

type Tab = 'Branding' | 'Web' | 'Content'
const TABS: Tab[] = ['Branding', 'Web', 'Content']

export default function ProjectGrid() {
  const [activeTab, setActiveTab] = useState<Tab>('Branding')
  const [items, setItems] = useState<CaseStudy[]>([])
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cases?type=work')
      .then((r) => r.json())
      .then((d: { items?: CaseStudy[] }) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter((p) => (p.tab ?? 'Branding') === activeTab)

  return (
    <div>
      <div className="ftabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`ftab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="pgrid2">
        {filtered.map((p) => (
          <div key={p.slug} className="pc2" onClick={() => setOpenSlug(p.slug)} style={{ cursor: 'pointer' }}>
            <div
              className="pth2"
              style={{ background: p.cover ? `center / cover no-repeat url(${p.cover})` : p.accent ?? '#1a1a1a' }}
            >
              {!p.cover && <div className="ptxt">{p.title}</div>}
            </div>
            <div className="pme2">
              <div className="pio2" style={{ background: p.accent ?? '#333' }}>{p.title.charAt(0).toUpperCase()}</div>
              <div>
                <div className="pnm2">{p.title}</div>
                <div className="pct2">{p.category ?? 'Work'}</div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>Loading work…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>No projects in this category yet.</div>
        )}
      </div>

      <CaseStudyModal slug={openSlug} onClose={() => setOpenSlug(null)} />
    </div>
  )
}
