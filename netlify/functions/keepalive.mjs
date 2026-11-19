/**
 * Netlify scheduled function that replaces the old Vercel cron. Once a day it
 * calls /api/keepalive, which does one small Appwrite read so the free-tier
 * project is not auto-paused for inactivity.
 *
 * Scheduled functions only run on the published production deploy. If
 * CRON_SECRET is set, it is sent as a Bearer token, which the route requires.
 */
export default async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://hasaka.io'
  const secret = process.env.CRON_SECRET
  const res = await fetch(`${base}/api/keepalive`, {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })
  const body = await res.text()
  console.log(`keepalive ${res.status}: ${body}`)
  return new Response(body, { status: res.status })
}

export const config = {
  schedule: '0 6 * * *',
}
