'use client'

import { useEffect, useState } from 'react'
import styles from './JournalGrid.module.css'
import type { JournalPost } from '@/lib/cases'

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
          <div className={styles.aMeta}>
            {[post.author, post.date].filter(Boolean).join(' · ')}
          </div>
          <div className={styles.aText}>
            {(post.body ?? post.excerpt ?? '').split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JournalGrid() {
  const [posts, setPosts] = useState<JournalPost[]>([])
  const [open, setOpen] = useState<JournalPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cases?type=journal')
      .then((r) => r.json())
      .then((d: { items?: JournalPost[] }) => setPosts(d.items ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.state}>Loading the journal…</div>
  if (posts.length === 0) return <div className={styles.state}>No journal entries yet.</div>

  return (
    <>
      <div className={styles.grid}>
        {posts.map((p) => (
          <article
            key={p.slug}
            className={`${styles.cell} ${styles[p.size ?? 'sm']}`}
            onClick={() => setOpen(p)}
          >
            {p.cover && (p.size === 'lg' || p.size === 'md') && (
              <div className={styles.thumb} style={{ backgroundImage: `url(${p.cover})` }} />
            )}
            {p.category && <span className={styles.pill}>{p.category}</span>}
            <h2 className={styles.title}>{p.title}</h2>
            {p.excerpt && <p className={styles.excerpt}>{p.excerpt}</p>}
            <div className={styles.byline}>{[p.author, p.date].filter(Boolean).join(' · ')}</div>
          </article>
        ))}
      </div>

      {open && <ArticleReader post={open} onClose={() => setOpen(null)} />}
    </>
  )
}
