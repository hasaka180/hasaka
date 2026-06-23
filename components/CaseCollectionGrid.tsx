'use client'

import { useEffect, useState } from 'react'
import CaseStudyModal from './CaseStudyModal'
import type { CaseStudy } from '@/lib/cases'

// reuse the Collections palette classes so the layout stays identical
const PALETTES = ['cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6']

// the case's hero image: cover, else the first image found in its sections
function coverImage(c: CaseStudy): string | undefined {
  if (c.cover) return c.cover
  for (const s of c.sections ?? []) {
    if (s.type === 'image' && s.src) return s.src
    if (s.type === 'grid') {
      const g = s.items.find((x) => x.src)
      if (g) return g.src
    }
  }
  return undefined
}

export default function CaseCollectionGrid({ initialItems }: { initialItems?: CaseStudy[] }) {
  const [cases, setCases] = useState<CaseStudy[]>(initialItems ?? [])
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(!initialItems)

  useEffect(() => {
    if (initialItems) return
    fetch('/api/cases?type=case')
      .then((r) => r.json())
      .then((d: { items?: CaseStudy[] }) => setCases(d.items ?? []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }, [initialItems])

  return (
    <>
      <div className="cgrid">
        {cases.map((c, i) => {
          const palette = PALETTES[i % PALETTES.length]
          const img = coverImage(c)
          return (
            <div
              key={c.slug}
              className="ccard"
              onClick={() => setOpenSlug(c.slug)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className={img ? 'cthumb' : `cthumb ${palette}`}
                style={img ? { background: `linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%), center / cover no-repeat url(${img})` } : undefined}
              >
                <div>
                  <div className="cby" style={img ? { color: 'rgba(255,255,255,0.85)' } : undefined}>{c.category ?? 'Case study'}</div>
                  <div className="ctit" style={img ? { color: '#fff' } : (palette === 'cb1' ? { color: '#1a3d1a' } : undefined)}>
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
