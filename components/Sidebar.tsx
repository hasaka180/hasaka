'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useCallback } from 'react'

const navItems = [
  {
    href: '/',
    label: 'Home',
    short: 'Home',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill="#111" />
      </svg>
    ),
  },
  {
    href: '/projects',
    label: 'Projects',
    short: 'Work',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="5" rx="1.5" fill="#111" />
        <rect x="2" y="9" width="16" height="5" rx="1.5" fill="#111" opacity=".5" />
        <rect x="2" y="16" width="10" height="2" rx="1" fill="#111" opacity=".3" />
      </svg>
    ),
  },
  {
    href: '/collections',
    label: 'Collections',
    short: 'Cases',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#111" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#111" opacity=".6" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#111" opacity=".6" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#111" opacity=".3" />
      </svg>
    ),
  },
  {
    href: '/services',
    label: 'Services',
    short: 'Services',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2.5 5.5L18 8.3l-4 3.9 1 5.8L10 15.3 5 18l1-5.8L2 8.3l5.5-.8L10 2z" fill="#111" />
      </svg>
    ),
  },
  {
    href: '/contact',
    label: 'Contact',
    short: 'Contact',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="9" rx="1.5" fill="#111" />
        <rect x="11" y="2" width="7" height="4" rx="1.5" fill="#111" opacity=".5" />
        <rect x="11" y="8" width="7" height="4" rx="1.5" fill="#111" opacity=".5" />
        <rect x="2" y="13" width="16" height="4" rx="1.5" fill="#111" opacity=".3" />
      </svg>
    ),
  },
  {
    href: '/hire',
    label: 'Hire me',
    short: 'Hire',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#111" strokeWidth="1.6" fill="none" />
        <circle cx="10" cy="8" r="2" fill="#111" />
        <path d="M7 14c0-1.657 1.343-3 3-3s3 1.343 3 3" fill="#111" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const closeSidebar = useCallback(() => {
    const sb = document.getElementById('sb')
    if (sb) sb.classList.remove('open')
    document.body.classList.remove('sb-open')
  }, [])

  const toggleSB = useCallback(() => {
    if (window.innerWidth > 860) {
      const sb = document.getElementById('sb')
      if (!sb) return
      const isOpen = sb.classList.toggle('open')
      document.body.classList.toggle('sb-open', isOpen)
    }
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const sb = document.getElementById('sb')
      if (sb?.classList.contains('open') && !sb.contains(e.target as Node)) {
        closeSidebar()
      }
    }
    const handleResize = () => {
      if (window.innerWidth <= 860) closeSidebar()
    }
    document.addEventListener('click', handleOutsideClick)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
      window.removeEventListener('resize', handleResize)
    }
  }, [closeSidebar])

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  return (
    <nav id="sb">
      <div className="sb-logo" onClick={toggleSB}>
        <div className="sb-logo-icon">
          <div className="nm">HASAKA</div>
          <div className="tg">
            Creative
            <br />
            Director™
          </div>
        </div>
        <div className="sb-logo-text">
          <div className="lnm">HASAKA</div>
          <div className="ltg">Creative Director™</div>
        </div>
      </div>

      <div className="sb-nav">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sni${isActive ? ' active' : ''}`}
            >
              <div className="sni-ic">
                {item.icon}
                <span className="sni-sm">{item.short}</span>
              </div>
              <span className="sni-full">{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="sb-bot">
        <div className="sb-lang-c">
          <a href="#">EN</a>
          <a href="#">T&amp;C</a>
        </div>
        <div className="sb-lang-e">
          <a href="#">English</a>
          <a href="#">T&amp;C</a>
        </div>
      </div>
    </nav>
  )
}
