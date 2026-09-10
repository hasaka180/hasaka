import type { MetadataRoute } from 'next'
import { getItems, itemType } from '@/lib/cases'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hasaka.io'

/* Regenerate hourly. Without this the sitemap is prerendered once at build
   time, so anything published in the studio stays out of it until the next
   deploy — which is how a new post ends up undiscoverable by search engines. */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes = ['', '/projects', '/collections', '/journal', '/services', '/contact', '/hire']

  const base: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))

  let dynamic: MetadataRoute.Sitemap = []
  try {
    const items = await getItems()
    dynamic = items.map((i) => {
      const isJournal = itemType(i) === 'journal'
      return {
        url: `${SITE_URL}/${isJournal ? 'journal' : 'cases'}/${i.slug}`,
        // The item's own timestamp, not the build time — search engines use
        // lastmod to decide what to recrawl, and a build stamp tells them
        // every page changed at once, every deploy.
        lastModified: i.updatedAt ? new Date(i.updatedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }
    })
  } catch {
    // if the CMS is unreachable at build time, still emit the static routes
  }

  return [...base, ...dynamic]
}
