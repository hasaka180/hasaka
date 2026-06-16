import { NextResponse } from 'next/server'
import { getCase, upsertCase, deleteCase, type CaseStudy } from '@/lib/cases'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: { slug: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const found = await getCase(params.slug)
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(found)
}

export async function PUT(req: Request, { params }: Ctx) {
  const body = (await req.json()) as Partial<CaseStudy>
  const saved = await upsertCase({
    slug: params.slug,
    title: body.title ?? params.slug,
    client: body.client,
    category: body.category,
    year: body.year,
    accent: body.accent,
    cover: body.cover,
    intro: body.intro,
    services: body.services ?? [],
    sections: body.sections ?? [],
  })
  return NextResponse.json(saved)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const ok = await deleteCase(params.slug)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
