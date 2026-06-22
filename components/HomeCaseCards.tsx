'use client'

import { useState } from 'react'
import Reveal from './RevealWrapper'
import CaseStudyModal from './CaseStudyModal'

const CARDS = [
  { slug: 'nexera-robotics', thumb: '/nexera-thumb.jpg', logo: '/logos/nexera-ico.png', name: 'Nexera Robotics', cat: 'Tech Startup' },
  { slug: 'realpha', thumb: '/realpha-thumb.jpg', logo: '/logos/realpha-ico.png', name: 'Realpha', cat: 'Real Estate' },
  { slug: 'lighthouse', thumb: '/lighthouse-thumb.jpg', logo: '/logos/lighthouse-ico.png', name: 'Lighthouse', cat: 'Tech Startup' },
  { slug: 'somoturismo', thumb: '/somoturismo-thumb.jpg', logo: '/logos/somoturismo-ico.png', name: 'Somo Turismo', cat: 'Hospitality' },
]

export default function HomeCaseCards() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <>
      <div className="pgrid4">
        {CARDS.map((c, i) => (
          <Reveal key={c.slug} delay={(i + 1) as 1 | 2 | 3 | 4} className="pc">
            <div onClick={() => setOpen(c.slug)} style={{ cursor: 'pointer' }}>
              <div className="pth" style={{ backgroundImage: `url(${c.thumb})` }} />
              <div className="pme">
                <div className="pio">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logo} alt={`${c.name} logo`} loading="lazy" decoding="async" />
                </div>
                <div>
                  <div className="pnm">{c.name}</div>
                  <div className="pct">{c.cat}</div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <CaseStudyModal slug={open} onClose={() => setOpen(null)} />
    </>
  )
}
