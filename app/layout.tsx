import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import Script from 'next/script'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hasaka.io'
const GSC_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION
const GTM_ID = 'GTM-NPFWHDRV' // add GA4 + other tags inside the GTM container
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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Preloader />
        <SmoothScroll />
        <CrispChat />
        <Sidebar />
        <main id="main">
          {children}
        </main>
      </body>
    </html>
  )
}
