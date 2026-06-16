import fs from 'fs/promises'
import path from 'path'
import { kv } from '@vercel/kv'

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
const KV_KEY = 'hasaka:cases'

// Use Vercel KV in production (filesystem is read-only there); fall back to the
// local JSON file for development so the builder works without any setup.
const useKV = !!process.env.KV_REST_API_URL

async function readStore(): Promise<Store> {
  if (useKV) {
    const cases = (await kv.get<CaseStudy[]>(KV_KEY)) ?? []
    // first run on a fresh KV: seed from the committed JSON file
    if (cases.length === 0) {
      const seeded = await readFileStore()
      if (seeded.cases.length) await kv.set(KV_KEY, seeded.cases)
      return seeded
    }
    return { cases }
  }
  return readFileStore()
}

async function writeStore(store: Store): Promise<void> {
  if (useKV) {
    await kv.set(KV_KEY, store.cases)
    return
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), 'utf-8')
}

async function readFileStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(FILE, 'utf-8')
    return JSON.parse(raw) as Store
  } catch {
    return { cases: [] }
  }
}

export async function getCases(): Promise<CaseStudy[]> {
  return (await readStore()).cases
}

export async function getCase(slug: string): Promise<CaseStudy | null> {
  const { cases } = await readStore()
  return cases.find((c) => c.slug === slug) ?? null
}

export async function upsertCase(input: CaseStudy): Promise<CaseStudy> {
  const store = await readStore()
  const idx = store.cases.findIndex((c) => c.slug === input.slug)
  if (idx >= 0) store.cases[idx] = input
  else store.cases.push(input)
  await writeStore(store)
  return input
}

export async function deleteCase(slug: string): Promise<boolean> {
  const store = await readStore()
  const before = store.cases.length
  store.cases = store.cases.filter((c) => c.slug !== slug)
  if (store.cases.length === before) return false
  await writeStore(store)
  return true
}
