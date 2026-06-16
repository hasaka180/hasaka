import { NextResponse } from 'next/server'
import { getCases, upsertCase, type CaseStudy } from '@/lib/cases'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cases = await getCases()
    return NextResponse.json({ cases })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<CaseStudy>
  if (!body.slug || !body.title) {
    return NextResponse.json({ error: 'slug and title are required' }, { status: 400 })
  }
  const created = await upsertCase({
    slug: body.slug,
    title: body.title,
    client: body.client,
    category: body.category,
    year: body.year,
    accent: body.accent,
    cover: body.cover,
    intro: body.intro,
    services: body.services ?? [],
    sections: body.sections ?? [],
  })
  return NextResponse.json(created, { status: 201 })
}
