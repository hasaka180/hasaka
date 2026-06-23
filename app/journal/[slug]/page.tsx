import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getItems, getItem, itemType, type JournalPost } from '@/lib/cases'
import JournalArticleView from '@/components/JournalArticleView'
import ModalCloseButton from '@/components/ModalCloseButton'
import styles from '@/components/JournalGrid.module.css'

export const revalidate = 600

export async function generateStaticParams() {
  const items = await getItems('journal')
  return items.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getItem(params.slug)
  if (!data || itemType(data) !== 'journal') return {}
  const p = data as JournalPost
  const title = `${p.title} — Hasaka Sasaranga`
  const description = p.excerpt || `${p.title} — from the Hasaka Sasaranga journal.`
  return {
    title,
    description,
    alternates: { canonical: `/journal/${p.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/journal/${p.slug}`,
      images: p.cover ? [{ url: p.cover }] : undefined,
      publishedTime: p.date,
      authors: p.author ? [p.author] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: p.cover ? [p.cover] : undefined },
  }
}

export default async function JournalArticlePage({ params }: { params: { slug: string } }) {
  const data = await getItem(params.slug)
  if (!data || itemType(data) !== 'journal') notFound()
  const p = data as JournalPost
  return (
    <div className={styles.pageWrap}>
      <ModalCloseButton className={styles.close} fallback="/journal" />
      <JournalArticleView post={p} />
    </div>
  )
}
