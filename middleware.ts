import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Password-gate the case builder.
 * - /studio (the builder UI) always requires the password.
 * - /api/cases write requests (POST/PUT/DELETE) require it too.
 * - GET /api/cases stays public so the case popups can read content.
 *
 * Set STUDIO_PASSWORD in your environment (e.g. Vercel → Project → Settings →
 * Environment Variables). Locally, if it's unset the gate is skipped.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isStudio = pathname.startsWith('/studio')
  const isWrite = pathname.startsWith('/api/cases') && req.method !== 'GET'
  if (!isStudio && !isWrite) return NextResponse.next()

  const password = process.env.STUDIO_PASSWORD
  if (!password) {
    // Fail closed in production, open in local dev for convenience.
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Studio disabled: STUDIO_PASSWORD is not set.', { status: 503 })
    }
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Basic ')) {
    try {
      const [, pwd] = atob(auth.slice(6)).split(':')
      if (pwd === password) return NextResponse.next()
    } catch {
      /* fall through to challenge */
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Hasaka Studio"' },
  })
}

export const config = {
  matcher: ['/studio/:path*', '/api/cases', '/api/cases/:path*'],
}
