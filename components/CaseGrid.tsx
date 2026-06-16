'use client'

import { useEffect, useState } from 'react'
import CaseStudyModal from './CaseStudyModal'
import type { CaseStudy } from '@/lib/cases'

/** Cases listing — pulls every case from the backend (Appwrite) and opens the
 *  same full-screen case-study popup as the Projects page. */
export default function CaseGrid() {
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
      <div className="pgrid2">
        {cases.map((c) => (
          <div
            key={c.slug}
            className="pc2"
            onClick={() => setOpenSlug(c.slug)}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="pth2"
              style={{ background: c.cover ? `center / cover no-repeat url(${c.cover})` : c.accent ?? '#1a1a1a' }}
            >
              {!c.cover && <div className="ptxt">{c.title}</div>}
            </div>
            <div className="pme2">
              <div className="pio2" style={{ background: c.accent ?? '#333' }}>
                {c.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="pnm2">{c.title}</div>
                <div className="pct2">{c.category ?? 'Case study'}</div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>Loading cases…</div>
        )}
        {!loading && cases.length === 0 && (
          <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>No cases yet.</div>
        )}
      </div>

      <CaseStudyModal slug={openSlug} onClose={() => setOpenSlug(null)} />
    </>
  )
}
