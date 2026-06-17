import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getItem, upsertItem, deleteItem, type ContentItem } from '@/lib/cases'

function revalidateContent() {
  for (const p of ['/', '/projects', '/collections', '/journal']) revalidatePath(p)
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: { slug: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const found = await getItem(params.slug)
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(found)
}

export async function PUT(req: Request, { params }: Ctx) {
  const body = (await req.json()) as Partial<ContentItem>
  const saved = await upsertItem({ ...(body as ContentItem), slug: params.slug })
  revalidateContent()
  return NextResponse.json(saved)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const ok = await deleteItem(params.slug)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  revalidateContent()
  return NextResponse.json({ ok: true })
}
