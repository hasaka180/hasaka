import fs from 'fs/promises'
import path from 'path'
import { Client, TablesDB, Query } from 'node-appwrite'

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

// TablesDB (rows) API — the modern Appwrite model. APPWRITE_COLLECTION_ID is
// used as the table id (a collection and a table share the same id).
const tables =
  AW.endpoint && AW.project && AW.apiKey && AW.db && AW.col
    ? new TablesDB(
        new Client().setEndpoint(AW.endpoint).setProject(AW.project).setKey(AW.apiKey),
      )
    : null

const parseRow = (row: Record<string, unknown>): CaseStudy =>
  JSON.parse((row.data as string) ?? '{}') as CaseStudy

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

/* One-time seed: if the Appwrite collection is empty, populate it from the
   committed data/cases.json. Idempotent (upsert by slug) and cached per runtime. */
let seedPromise: Promise<void> | null = null
async function ensureSeeded(): Promise<void> {
  if (!tables) return
  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        const res = await tables.listRows({ databaseId: AW.db!, tableId: AW.col!, queries: [Query.limit(1)] })
        if (res.total > 0) return
        const { cases } = await readFileStore()
        for (const c of cases) {
          await tables.upsertRow({
            databaseId: AW.db!,
            tableId: AW.col!,
            rowId: c.slug,
            data: { slug: c.slug, title: c.title, data: JSON.stringify(c) },
          })
        }
      } catch {
        seedPromise = null // allow a retry on the next request
      }
    })()
  }
  return seedPromise
}

/* ── public API (used by the route handlers) ── */
export async function getCases(): Promise<CaseStudy[]> {
  if (tables) {
    await ensureSeeded()
    const res = await tables.listRows({ databaseId: AW.db!, tableId: AW.col!, queries: [Query.limit(100)] })
    return res.rows.map((r) => parseRow(r as Record<string, unknown>))
  }
  return (await readFileStore()).cases
}

export async function getCase(slug: string): Promise<CaseStudy | null> {
  if (tables) {
    await ensureSeeded()
    try {
      return parseRow((await tables.getRow({ databaseId: AW.db!, tableId: AW.col!, rowId: slug })) as Record<string, unknown>)
    } catch {
      return null
    }
  }
  const { cases } = await readFileStore()
  return cases.find((c) => c.slug === slug) ?? null
}

export async function upsertCase(input: CaseStudy): Promise<CaseStudy> {
  if (tables) {
    await tables.upsertRow({
      databaseId: AW.db!,
      tableId: AW.col!,
      rowId: input.slug,
      data: { slug: input.slug, title: input.title, data: JSON.stringify(input) },
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
  if (tables) {
    try {
      await tables.deleteRow({ databaseId: AW.db!, tableId: AW.col!, rowId: slug })
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
