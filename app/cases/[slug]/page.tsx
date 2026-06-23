import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getItems, getItem, itemType, type CaseStudy } from '@/lib/cases'
import CaseStudyView from '@/components/CaseStudyView'
import ModalCloseButton from '@/components/ModalCloseButton'
import styles from '@/components/CaseStudyModal.module.css'

export const revalidate = 600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hasaka.io'

const abs = (src?: string) => (!src ? undefined : src.startsWith('http') ? src : `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`)

export async function generateStaticParams() {
  const items = await getItems()
  return items.filter((i) => itemType(i) !== 'journal').map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getItem(params.slug)
  if (!data || itemType(data) === 'journal') return {}
  const c = data as CaseStudy
  const title = `${c.title} — Hasaka Sasaranga`
  const description = c.intro || `${c.title} — a brand case study by Hasaka Sasaranga.`
  return {
    title,
    description,
    alternates: { canonical: `/cases/${c.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/cases/${c.slug}`,
      images: c.cover ? [{ url: c.cover }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: c.cover ? [c.cover] : undefined },
  }
}

export default async function CasePage({ params }: { params: { slug: string } }) {
  const data = await getItem(params.slug)
  if (!data || itemType(data) === 'journal') notFound()
  const c = data as CaseStudy
  const back = c.type === 'work' ? '/projects' : '/collections'
  const shareUrl = `${SITE_URL}/cases/${c.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: c.title,
    description: c.intro || `${c.title} — a brand case study by Hasaka Sasaranga.`,
    image: abs(c.cover) ? [abs(c.cover)] : undefined,
    datePublished: c.year ? `${c.year}-01-01` : undefined,
    author: { '@type': 'Person', name: 'Hasaka Sasaranga' },
    publisher: { '@type': 'Person', name: 'Hasaka Sasaranga' },
    url: shareUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
    about: c.client || undefined,
  }
  return (
    <div className={styles.pageWrap}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ModalCloseButton className={styles.close} fallback={back} />
      <CaseStudyView data={c} shareUrl={shareUrl} />
    </div>
  )
}
