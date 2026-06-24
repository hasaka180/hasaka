'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { CaseStudy } from '@/lib/cases'

type Tab = 'Branding' | 'Web' | 'Content'
const TABS: Tab[] = ['Branding', 'Web', 'Content']

type Media = { type: 'image' | 'video'; src: string }
const VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i
const mediaStyle = { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' }

// gather every image/video inside a work item (cover + section media)
function collectMedia(item: CaseStudy): Media[] {
  const out: Media[] = []
  if (item.cover) out.push({ type: VIDEO_RE.test(item.cover) ? 'video' : 'image', src: item.cover })
  for (const s of item.sections ?? []) {
    if (s.type === 'image' && s.src) out.push({ type: 'image', src: s.src })
    else if (s.type === 'video' && s.src) out.push({ type: 'video', src: s.src })
    else if (s.type === 'grid') for (const g of s.items) if (g.src) out.push({ type: 'image', src: g.src })
  }
  return out.filter((m, i, a) => a.findIndex((x) => x.src === m.src) === i)
}

/** Work-card thumbnail that previews the media inside the case (auto-crossfade). */
function CardPreview({ item }: { item: CaseStudy }) {
  const media = useMemo(() => collectMedia(item).slice(0, 5), [item])
  const [i, setI] = useState(0)

  useEffect(() => {
    if (media.length < 2) return
    const id = setInterval(() => setI((p) => (p + 1) % media.length), 2000)
    return () => clearInterval(id)
  }, [media.length])

  if (media.length === 0) {
    return (
      <div className="pth2" style={{ background: item.accent ?? '#1a1a1a' }}>
        <div className="ptxt">{item.title}</div>
      </div>
    )
  }

  return (
    <div className="pth2" style={{ position: 'relative', overflow: 'hidden', background: item.accent ?? '#1a1a1a' }}>
      {media.map((m, idx) => (
        <div key={m.src} style={{ position: 'absolute', inset: 0, opacity: idx === i ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          {m.type === 'video'
            ? (idx === i ? <video src={m.src} muted loop playsInline autoPlay preload="metadata" style={mediaStyle} /> : null)
            : <img src={m.src} alt="" loading="lazy" decoding="async" style={mediaStyle} />}
        </div>
      ))}
      {media.length > 1 && (
        <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4, zIndex: 1 }}>
          {media.map((m, idx) => (
            <span key={m.src} style={{ width: 5, height: 5, borderRadius: '50%', background: idx === i ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectGrid({ initialItems }: { initialItems?: CaseStudy[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('Branding')
  const [items, setItems] = useState<CaseStudy[]>(initialItems ?? [])
  const [loading, setLoading] = useState(!initialItems)

  useEffect(() => {
    if (initialItems) return // server-provided → no client fetch needed
    fetch('/api/cases?type=work')
      .then((r) => r.json())
      .then((d: { items?: CaseStudy[] }) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [initialItems])

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
          <Link key={p.slug} href={`/cases/${p.slug}`} className="pc2">
            <CardPreview item={p} />
            <div className="pme2">
              <div className="pio2" style={{ background: p.icon ? 'transparent' : (p.accent ?? '#333') }}>
                {p.icon
                  ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.icon} alt="" loading="lazy" decoding="async" />
                  : p.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="pnm2">{p.title}</div>
                <div className="pct2">{p.category ?? 'Work'}</div>
              </div>
            </div>
          </Link>
        ))}
        {loading && (
          <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>Loading work…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 0', color: '#aaa', fontSize: 14 }}>No projects in this category yet.</div>
        )}
      </div>
    </div>
  )
}
