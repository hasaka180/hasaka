import type { CSSProperties } from 'react'
import styles from './JournalGrid.module.css'
import type { JournalPost } from '@/lib/cases'

const fmtDate = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
}

/** Presentational journal article — used by the route page (and could back a modal). */
export default function JournalArticleView({ post }: { post: JournalPost }) {
  const meta = [post.author, fmtDate(post.date)].filter(Boolean).join(' · ')
  return (
    <article
      className={styles.sheet}
      style={{
        ...(post.bg ? { ['--sb' as string]: post.bg } : {}),
        ...(post.fg ? { ['--sf' as string]: post.fg } : {}),
      } as CSSProperties}
    >
      {post.cover && <div className={styles.aCover} style={{ backgroundImage: `url(${post.cover})` }} />}
      <div className={styles.aBody}>
        {post.category && <div className={styles.aPill}>{post.category}</div>}
        <h1 className={styles.aTitle}>{post.title}</h1>
        {meta && <div className={styles.aMeta}>{meta}</div>}
        <div className={styles.aText}>
          {(post.body ?? post.excerpt ?? '').split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </article>
  )
}
