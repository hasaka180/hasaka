import Link from 'next/link'
import Reveal from './RevealWrapper'

const CARDS = [
  { slug: 'nexera-robotics', thumb: '/nexera-thumb.jpg', logo: '/logos/nexera-ico.png', name: 'Nexera Robotics', cat: 'Tech Startup' },
  { slug: 'realpha', thumb: '/realpha-thumb.jpg', logo: '/logos/realpha-ico.png', name: 'Realpha', cat: 'Real Estate' },
  { slug: 'lighthouse-app', thumb: '/lighthouse-thumb.jpg', logo: '/logos/lighthouse-ico.png', name: 'Lighthouse', cat: 'Tech Startup' },
  { slug: 'somo-turismo-travel', thumb: '/somoturismo-thumb.jpg', logo: '/logos/somoturismo-ico.png', name: 'Somo Turismo', cat: 'Hospitality' },
]

export default function HomeCaseCards() {
  return (
    <div className="pgrid4">
      {CARDS.map((c, i) => (
        <Reveal key={c.slug} delay={(i + 1) as 1 | 2 | 3 | 4} className="pc">
          <Link href={`/cases/${c.slug}`}>
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
          </Link>
        </Reveal>
      ))}
    </div>
  )
}
