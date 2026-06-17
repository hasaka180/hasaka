'use client'

import { useEffect, useState, type ReactNode } from 'react'
import styles from './JournalGrid.module.css'
import type { JournalPost } from '@/lib/cases'

const fmtDate = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
}
const byline = (p: JournalPost) => [p.author, fmtDate(p.date)].filter(Boolean).join(' · ')

/* ── static "Studio Notes" sidebar ── */
const EXPLORING: { icon: ReactNode; title: string; desc: string }[] = [
  { icon: <FlowerIcon />, title: 'Human × Machine', desc: 'Designing for an AI-native future.' },
  { icon: <LayersIcon />, title: 'Editorial Systems', desc: 'Clarity, structure and rhythm.' },
  { icon: <SparkIcon />, title: 'AI × Branding', desc: 'Building adaptive brand identities.' },
]
const READING = ['The Design of Everyday Things', 'Brand Strategy — Marty Neumeier', 'Made to Stick — Chip Heath']

function NotesSidebar() {
  return (
    <aside className={`${styles.card} ${styles.notes}`}>
      <div>
        <div className={styles.eyebrow}>Studio Notes</div>
        <div className={styles.nh} style={{ marginTop: 8 }}>Currently exploring</div>
      </div>
      <div className={styles.exploreList}>
        {EXPLORING.map((e) => (
          <div key={e.title} className={styles.exItem}>
            <span className={styles.exIco}>{e.icon}</span>
            <div>
              <div className={styles.exTitle}>{e.title}</div>
              <div className={styles.exDesc}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.divider} />
      <div>
        <div className={styles.readH}>Currently reading</div>
        <ul className={styles.readList}>
          {READING.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>
      <div className={styles.divider} />
      <div>
        <span className={styles.quoteMark}>“</span>
        <div className={styles.quote}>Good design is invisible.<br />Great design is inevitable.</div>
        <div className={styles.quoteBy}>— Observation</div>
      </div>
    </aside>
  )
}

function ArticleReader({ post, onClose }: { post: JournalPost; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        {post.cover && <div className={styles.aCover} style={{ backgroundImage: `url(${post.cover})` }} />}
        <div className={styles.aBody}>
          {post.category && <div className={styles.aPill}>{post.category}</div>}
          <h1 className={styles.aTitle}>{post.title}</h1>
          <div className={styles.aMeta}>{byline(post)}</div>
          <div className={styles.aText}>
            {(post.body ?? post.excerpt ?? '').split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JournalGrid({ initialItems }: { initialItems?: JournalPost[] }) {
  const [posts, setPosts] = useState<JournalPost[]>(initialItems ?? [])
  const [open, setOpen] = useState<JournalPost | null>(null)
  const [loading, setLoading] = useState(!initialItems)

  useEffect(() => {
    if (initialItems) return
    fetch('/api/cases?type=journal')
      .then((r) => r.json())
      .then((d: { items?: JournalPost[] }) => setPosts(d.items ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [initialItems])

  if (loading) return <div className={styles.state}>Loading the journal…</div>
  if (posts.length === 0) return <div className={styles.state}>No journal entries yet.</div>

  const featured = posts.find((p) => p.size === 'lg') ?? posts[0]
  const rest = posts.filter((p) => p !== featured)
  const mediums = (rest.filter((p) => p.size === 'md').length ? rest.filter((p) => p.size === 'md') : rest.slice(0, 2)).slice(0, 2)
  const usedMed = new Set(mediums)
  const smalls = rest.filter((p) => !usedMed.has(p))

  return (
    <>
      <div className={styles.jwrap}>
        {/* tier 1 */}
        <div className={styles.jtop}>
          {featured && (
            <article className={`${styles.card} ${styles.feature}`} onClick={() => setOpen(featured)}>
              {featured.cover && (
                <div className={styles.cover}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.cover} alt="" decoding="async" />
                </div>
              )}
              <div className={styles.fbody}>
                {featured.category && <span className={styles.pill}>{featured.category}</span>}
                <h2 className={styles.ftitle}>{featured.title}</h2>
                {featured.excerpt && <p className={styles.fexcerpt}>{featured.excerpt}</p>}
                <div className={styles.byline}>{byline(featured)}</div>
              </div>
            </article>
          )}
          <NotesSidebar />
        </div>

        {/* tier 2 */}
        {mediums.length > 0 && (
          <div className={styles.jrow2}>
            {mediums.map((p) => (
              <article key={p.slug} className={`${styles.card} ${styles.mcard}`} onClick={() => setOpen(p)}>
                {p.cover && (
                  <div className={styles.cover}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover} alt="" loading="lazy" decoding="async" />
                  </div>
                )}
                <div className={styles.mbody}>
                  {p.category && <span className={styles.pill}>{p.category}</span>}
                  <h3 className={styles.mtitle}>{p.title}</h3>
                  {p.excerpt && <p className={styles.mexcerpt}>{p.excerpt}</p>}
                  <div className={styles.byline}>{byline(p)}</div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* tier 3 */}
        {smalls.length > 0 && (
          <div className={styles.jrow3}>
            {smalls.map((p) => (
              <article key={p.slug} className={`${styles.card} ${styles.scard}`} onClick={() => setOpen(p)}>
                {p.category && <span className={styles.pill}>{p.category}</span>}
                <h3 className={styles.stitle}>{p.title}</h3>
                {p.excerpt && <p className={styles.sexcerpt}>{p.excerpt}</p>}
                <div className={styles.sfoot}>
                  <span className={styles.byline}>{byline(p)}</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {open && <ArticleReader post={open} onClose={() => setOpen(null)} />}
    </>
  )
}

/* ── small inline icons ── */
function FlowerIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
      <path d="M10 2c1.3 0 2 1.2 2 2.5C13.3 3.7 14.7 4 15.4 5.1c.7 1.1.2 2.5-.9 3.2 1.3.1 2.3 1 2.3 2.2s-1 2.1-2.3 2.2c1.1.7 1.6 2.1.9 3.2-.7 1.1-2.1 1.4-3.4.6C12 17.8 11.3 19 10 19s-2-1.2-2-2.5c-1.3.8-2.7.5-3.4-.6-.7-1.1-.2-2.5.9-3.2C4.2 12.6 3.2 11.7 3.2 10.5S4.2 8.4 5.5 8.3c-1.1-.7-1.6-2.1-.9-3.2C5.3 4 6.7 3.7 8 4.5 8 3.2 8.7 2 10 2z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="10" cy="10.5" r="2" fill="currentColor" />
    </svg>
  )
}
function LayersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
      <path d="M10 3l7 3.5-7 3.5-7-3.5L10 3z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M3 11l7 3.5 7-3.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  )
}
function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
      <path d="M10 2l1.6 4.9L16.5 8l-4.9 1.1L10 14l-1.6-4.9L3.5 8l4.9-1.1L10 2z" fill="currentColor" />
    </svg>
  )
}
