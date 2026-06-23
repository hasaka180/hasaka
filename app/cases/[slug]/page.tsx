import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getItems, getItem, itemType, type CaseStudy } from '@/lib/cases'
import CaseStudyView from '@/components/CaseStudyView'
import ModalCloseButton from '@/components/ModalCloseButton'
import styles from '@/components/CaseStudyModal.module.css'

export const revalidate = 600

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
  return (
    <div className={styles.pageWrap}>
      <ModalCloseButton className={styles.close} fallback={back} />
      <CaseStudyView data={c} />
    </div>
  )
}
