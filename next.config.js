/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com *.crisp.chat vercel.live *.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' data: fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https: wss:",
              "media-src 'self' https:",
              "frame-src *.googletagmanager.com vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
module.exports = nextConfig
