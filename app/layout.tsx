import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import SmoothScroll from '@/components/SmoothScroll'

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
  title: 'Hasaka — Creative Director',
  description: 'Brand-first creative director. 8 years of building identities that outlive their moment.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${helveticaNow.variable}`}>
      <body>
        <SmoothScroll />
        <Sidebar />
        <div id="main">
          {children}
        </div>
      </body>
    </html>
  )
}
