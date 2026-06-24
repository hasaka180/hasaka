import { NextResponse } from 'next/server'
import { ping } from '@/lib/cases'

/**
 * Keep-alive endpoint hit by the Vercel cron (see vercel.json). Performs one
 * tiny Appwrite read so the free-tier project registers activity and is not
 * auto-paused for inactivity. Safe to call manually too.
 *
 * If CRON_SECRET is set in the environment, Vercel's cron sends it as a Bearer
 * token and we require it; otherwise the route is open (the read is harmless).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await ping()
  return NextResponse.json(
    { pingedAt: new Date().toISOString(), ...result },
    { status: result.ok ? 200 : 500 },
  )
}
