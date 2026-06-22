import Link from 'next/link'
import Hero from '@/components/Hero'
import LogoCarousel from '@/components/LogoCarousel'
import USPSection from '@/components/USPSection'
import ServiceCards from '@/components/ServiceCards'
import Reveal from '@/components/RevealWrapper'
import DesignPractice from '@/components/DesignPractice'
import TextAnimateBlur from '@/components/TextAnimateBlur'
import JournalFeatured from '@/components/JournalFeatured'
import HomeCaseCards from '@/components/HomeCaseCards'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      <Hero />
      <LogoCarousel />
      <USPSection />


      <Reveal className="sec">
        <div className="ey">A simple and effective approach.</div>
        <h2 className="sh"><TextAnimateBlur text={"Strategy first.\nCraft always.\nVision that endures."} stagger={90} duration={650} /></h2>
        <div className="tcol">
          <div className="bt">
            <p>I started as a graphic designer — hands on type, grids, and marks. That foundation became the bedrock beneath every brand strategy I&apos;ve written and every visual system I&apos;ve built.</p>
            <p>Most brands look forgettable because they&apos;re built backwards — style first, substance never. I work the other way.</p>
          </div>
          <div className="bt">
            <p>With 8+ years across Brandfactory, Carthagos, I&apos;ve led 100+ brand projects spanning luxury hospitality, fintech, consumer goods, fashion, tech, and cultural institutions.</p>
            <p>Today I integrate generative AI, motion design, and vibe coding alongside classic brand craft.</p>
          </div>
        </div>
      </Reveal>

      <DesignPractice />

      <Reveal className="sec">
        <div className="row-hd">
          <h2><TextAnimateBlur text="Selected brand cases" stagger={90} duration={650} /></h2>
          <Link href="/projects" className="al">All →</Link>
        </div>
        <HomeCaseCards />
      </Reveal>

      <Reveal className="sec svc-sec">
        <div className="svc-hd">
          <div>
            <div className="ey">WHAT I DO</div>
            <h2 className="sh svc-title">
              <TextAnimateBlur text="Services that build brands." stagger={90} duration={650} />
            </h2>
          </div>
          <div className="svc-hd-right">
            <p className="svc-hd-desc">From strategy to storytelling, I help brands show up with purpose and make a lasting impact.</p>
            <a href="/hire" className="svc-hd-cta">Let&apos;s work together &nbsp;→</a>
          </div>
        </div>
        <ServiceCards />
      </Reveal>

      <Reveal className="nuts">
        <div className="nuts-left">
          <h2><TextAnimateBlur text="Hasaka in a nutshell" stagger={90} duration={650} /></h2>
          <table className="ntbl">
            <tbody>
              <tr>
                <td className="kl"><span className="ic">○</span>Active since</td>
                <td className="kv">2016</td>
              </tr>
              <tr>
                <td className="kl"><span className="ic">○</span>Disciplines</td>
                <td className="kv">
                  <a className="alink" href="#">Brand Identity <span>→</span></a>
                  <a className="alink" href="#">Brand Strategy <span>→</span></a>
                  <a className="alink" href="#">Creative Direction <span>→</span></a>
                  <a className="alink" href="#">Visual Systems &amp; Brand Guide <span>→</span></a>
                  <a className="alink" href="#">AI Brand Tools <span>→</span></a>
                </td>
              </tr>
              <tr>
                <td className="kl"><span className="ic">✦</span>Brand cases</td>
                <td className="kv">100+</td>
              </tr>
              <tr>
                <td className="kl"><span className="ic">✦</span>Years active</td>
                <td className="kv">8</td>
              </tr>
              <tr>
                <td className="kl"><span className="ic">#</span>Industries</td>
                <td className="kv">All — hospitality, fintech, fashion, tech, culture, FMCG</td>
              </tr>
              <tr>
                <td className="kl"><span className="ic">✦</span>Studios</td>
                <td className="kv">Brandfactory, Carthagos</td>
              </tr>
              <tr>
                <td className="kl"><span className="ic">○</span>Superpowers</td>
                <td className="kv">Brand craft · Generative AI · Vibe coding · Multimedia</td>
              </tr>
              <tr>
                <td className="kl"><span className="ic">↗</span>Online</td>
                <td className="kv">
                  <a className="alink" href="#">Behance <span>↗</span></a>
                  <a className="alink" href="#">LinkedIn <span>↗</span></a>
                  <a className="alink" href="#">Instagram <span>↗</span></a>
                  <a className="alink" href="#">Dribbble <span>↗</span></a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <aside className="blog">
          <div className="blog-hd">
            <h3><TextAnimateBlur text="From the journal" stagger={90} duration={650} /></h3>
            <Link href="/journal" className="blog-all">All →</Link>
          </div>
          <JournalFeatured />
        </aside>
      </Reveal>

      <Reveal className="hcta">
        <h2><TextAnimateBlur text="Let's build something unforgettable together." stagger={90} duration={650} /></h2>
        <div className="ctar">
          <p>I take on a small number of brand projects each year — the ones where I can go deep and make work that truly matters. If you&apos;re building a brand that needs to stand for something, I&apos;d like to hear about it.</p>
          <a href="mailto:hello@hasaka.io" className="cta-em">hello@hasaka.io</a>
          <Link href="/hire" className="btn-dark">Start a project &nbsp;→</Link>
        </div>
      </Reveal>

      <div className="hft">
        <span className="cp">© 2025 Hasaka™ — Creative Director</span>
        <div className="hft-ln">
          <a href="#">Behance</a>
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
          <a href="#">T&amp;C</a>
        </div>
      </div>

    </div>
  )
}
