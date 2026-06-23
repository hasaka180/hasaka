import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import Script from 'next/script'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hasaka.io'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const GSC_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION
import Sidebar from '@/components/Sidebar'
import SmoothScroll from '@/components/SmoothScroll'
import CrispChat from '@/components/CrispChat'
import Preloader from '@/components/Preloader'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const helveticaNow = localFont({
  src: [
    { path: '../public/fonts/HelveticaNowDisplay-Medium.otf', weight: '500', style: 'normal' },
  ],
  variable: '--font-helvetica-now',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Hasaka — Creative Director',
  description: 'Brand-first creative director. 8 years of building identities that outlive their moment.',
  icons: { icon: '/favicon.png', shortcut: '/favicon.png', apple: '/favicon.png' },
  ...(GSC_VERIFICATION ? { verification: { google: GSC_VERIFICATION } } : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${helveticaNow.variable}`}>
      <body>
        <Preloader />
        <SmoothScroll />
        <CrispChat />
        <Sidebar />
        <main id="main">
          {children}
        </main>

        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
