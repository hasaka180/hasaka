import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getItems, getItem, itemType, type JournalPost } from '@/lib/cases'
import JournalArticleView from '@/components/JournalArticleView'
import ModalCloseButton from '@/components/ModalCloseButton'
import styles from '@/components/JournalGrid.module.css'

export const revalidate = 600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hasaka.io'

const abs = (src?: string) => (!src ? undefined : src.startsWith('http') ? src : `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`)

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
  const url = `${SITE_URL}/journal/${p.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt || `${p.title} — from the Hasaka Sasaranga journal.`,
    image: abs(p.cover) ? [abs(p.cover)] : undefined,
    datePublished: p.date,
    dateModified: p.date,
    author: { '@type': 'Person', name: p.author || 'Hasaka Sasaranga' },
    publisher: { '@type': 'Person', name: 'Hasaka Sasaranga' },
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
  return (
    <div className={styles.pageWrap}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ModalCloseButton className={styles.close} fallback="/journal" />
      <JournalArticleView post={p} shareUrl={url} />
    </div>
  )
}
