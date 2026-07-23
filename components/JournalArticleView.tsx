import type { CSSProperties } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './JournalGrid.module.css'
import ShareButtons from './ShareButtons'
import FaqAccordion from './FaqAccordion'
import type { JournalPost } from '@/lib/cases'

const fmtDate = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
}

/** Presentational journal article — used by the route page (and could back a modal). */
export default function JournalArticleView({ post, shareUrl }: { post: JournalPost; shareUrl?: string }) {
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
        {(post.summaryTitle || post.summaryDescription) && (
          <div className={styles.aSummary}>
            {post.summaryTitle && <h2 className={styles.aSummaryTitle}>{post.summaryTitle}</h2>}
            {post.summaryDescription && <p className={styles.aSummaryDesc}>{post.summaryDescription}</p>}
          </div>
        )}
        <div className={styles.aText}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.body ?? post.excerpt ?? ''}
          </ReactMarkdown>
        </div>
        {post.faqs && post.faqs.length > 0 && (
          <FaqAccordion faqs={post.faqs} />
        )}
        {shareUrl && (
          <div className={styles.aShare}>
            <ShareButtons url={shareUrl} title={post.title} />
          </div>
        )}
      </div>
    </article>
  )
}
