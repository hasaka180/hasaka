import Link from 'next/link'
import ServiceCards from '@/components/ServiceCards'
import ScrubVideo from '@/components/ScrubVideo'
import TextAnimateBlur from '@/components/TextAnimateBlur'

export const metadata = {
  title: 'Services — Hasaka Sasaranga',
  description: 'Brand strategy, identity, creative direction, visual systems and AI brand tools — from positioning to launch.',
}

export default function ServicesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <div className="svhero">
        <ScrubVideo />
        <div className="svic">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3 6.5L22 9.3l-5 4.9 1.2 7L12 18l-6.2 3.2L7 14.2 2 9.3l7-.8L12 2z" fill="rgba(255,255,255,0.5)" />
          </svg>
        </div>
        <Link href="/hire" className="svhirebtn">Hire me &nbsp;+</Link>
        <div className="svcont">
          <div className="svtit"><TextAnimateBlur text="Making your brand iconic and enduring." stagger={90} duration={650} /></div>
          <div className="svnav">
            <div className="ai">00. &nbsp;Overview</div>
            <a href="#">01. &nbsp;Brand Strategy</a>
            <a href="#">02. &nbsp;Brand Identity</a>
            <a href="#">03. &nbsp;Visual Systems</a>
            <a href="#">04. &nbsp;Creative Direction</a>
            <a href="#">05. &nbsp;AI Brand Systems</a>
          </div>
        </div>
      </div>

      <div className="svbody">
        <h2><TextAnimateBlur text="A simple and effective formula." stagger={90} duration={650} /></h2>
        <ServiceCards />
      </div>

    </div>
  )
}
