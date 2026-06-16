'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { JournalPost } from '@/lib/cases'

/** Homepage "From the journal" feed — pulls featured journal posts from the
 *  backend and renders them in the existing .btile masonry style. */
export default function JournalFeatured() {
  const [posts, setPosts] = useState<JournalPost[]>([])

  useEffect(() => {
    fetch('/api/cases?type=journal')
      .then((r) => r.json())
      .then((d: { items?: JournalPost[] }) => {
        const items = d.items ?? []
        const featured = items.filter((p) => p.featured)
        setPosts((featured.length ? featured : items).slice(0, 6))
      })
      .catch(() => setPosts([]))
  }, [])

  return (
    <div className="blog-list">
      {posts.map((p) => (
        <Link key={p.slug} href="/journal" className="btile">
          {p.cover && <div className="bt-img" style={{ backgroundImage: `url(${p.cover})` }} />}
          {p.category && <span className="bt-pill">{p.category}</span>}
          <div className="bt-title">{p.title}</div>
          <div className="bt-author">{p.author ?? 'Hasaka'}</div>
        </Link>
      ))}
    </div>
  )
}
