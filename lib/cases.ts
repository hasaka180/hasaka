import fs from 'fs/promises'
import path from 'path'
import { Client, Databases, Query } from 'node-appwrite'

/* ── Section-based content model (the "builder" blocks) ── */
export type Section =
  | { id: string; type: 'text'; eyebrow?: string; heading?: string; body?: string; align?: 'left' | 'center' }
  | { id: string; type: 'image'; src: string; caption?: string; full?: boolean }
  | { id: string; type: 'video'; src: string; poster?: string; full?: boolean }
  | { id: string; type: 'columns'; items: { heading?: string; body?: string }[] }
  | { id: string; type: 'grid'; columns?: number; items: { src: string; caption?: string }[] }

export type CaseStudy = {
  slug: string
  title: string
  client?: string
  category?: string
  year?: string
  accent?: string // hero background colour
  cover?: string // hero image/video url (optional)
  intro?: string
  services?: string[]
  sections: Section[]
}

type Store = { cases: CaseStudy[] }

const FILE = path.join(process.cwd(), 'data', 'cases.json')

/* ──────────────────────────────────────────────────────────
   Storage: Appwrite when configured, else local JSON file.
   Each case is one Appwrite document (id = slug) with the full
   CaseStudy serialised into a `data` string attribute.
────────────────────────────────────────────────────────── */
const AW = {
  endpoint: process.env.APPWRITE_ENDPOINT,
  project: process.env.APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY,
  db: process.env.APPWRITE_DATABASE_ID,
  col: process.env.APPWRITE_COLLECTION_ID,
}

const databases =
  AW.endpoint && AW.project && AW.apiKey && AW.db && AW.col
    ? new Databases(
        new Client().setEndpoint(AW.endpoint).setProject(AW.project).setKey(AW.apiKey),
      )
    : null

const parseDoc = (doc: Record<string, unknown>): CaseStudy =>
  JSON.parse((doc.data as string) ?? '{}') as CaseStudy

/* ── file fallback (local dev) ── */
async function readFileStore(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf-8')) as Store
  } catch {
    return { cases: [] }
  }
}
async function writeFileStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), 'utf-8')
}

/* ── public API (used by the route handlers) ── */
export async function getCases(): Promise<CaseStudy[]> {
  if (databases) {
    const res = await databases.listDocuments(AW.db!, AW.col!, [Query.limit(100)])
    return res.documents.map((d) => parseDoc(d as Record<string, unknown>))
  }
  return (await readFileStore()).cases
}

export async function getCase(slug: string): Promise<CaseStudy | null> {
  if (databases) {
    try {
      return parseDoc((await databases.getDocument(AW.db!, AW.col!, slug)) as Record<string, unknown>)
    } catch {
      return null
    }
  }
  const { cases } = await readFileStore()
  return cases.find((c) => c.slug === slug) ?? null
}

export async function upsertCase(input: CaseStudy): Promise<CaseStudy> {
  if (databases) {
    await databases.upsertDocument(AW.db!, AW.col!, input.slug, {
      slug: input.slug,
      title: input.title,
      data: JSON.stringify(input),
    })
    return input
  }
  const store = await readFileStore()
  const idx = store.cases.findIndex((c) => c.slug === input.slug)
  if (idx >= 0) store.cases[idx] = input
  else store.cases.push(input)
  await writeFileStore(store)
  return input
}

export async function deleteCase(slug: string): Promise<boolean> {
  if (databases) {
    try {
      await databases.deleteDocument(AW.db!, AW.col!, slug)
      return true
    } catch {
      return false
    }
  }
  const store = await readFileStore()
  const before = store.cases.length
  store.cases = store.cases.filter((c) => c.slug !== slug)
  if (store.cases.length === before) return false
  await writeFileStore(store)
  return true
}
