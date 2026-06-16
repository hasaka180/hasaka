'use client'

import { useEffect, useState } from 'react'
import CaseStudyModal from './CaseStudyModal'
import type { CaseStudy } from '@/lib/cases'

// reuse the Collections palette classes so the layout stays identical
const PALETTES = ['cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6']

export default function CaseCollectionGrid() {
  const [cases, setCases] = useState<CaseStudy[]>([])
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then((d: { cases?: CaseStudy[] }) => setCases(d.cases ?? []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="cgrid">
        {cases.map((c, i) => {
          const palette = PALETTES[i % PALETTES.length]
          return (
            <div
              key={c.slug}
              className="ccard"
              onClick={() => setOpenSlug(c.slug)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`cthumb ${palette}`}>
                <div>
                  <div className="cby">{c.category ?? 'Case study'}</div>
                  <div className="ctit" style={palette === 'cb1' ? { color: '#1a3d1a' } : undefined}>
                    {c.title}
                  </div>
                </div>
              </div>
              <div className="cdesc">{c.intro ?? ''}</div>
            </div>
          )
        })}

        {loading && <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>Loading case studies…</div>}
        {!loading && cases.length === 0 && (
          <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>No case studies yet.</div>
        )}
      </div>

      <CaseStudyModal slug={openSlug} onClose={() => setOpenSlug(null)} />
    </>
  )
}
