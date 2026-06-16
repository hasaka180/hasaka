"use client";

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './USPSection.module.css';
import TextAnimateBlur from './TextAnimateBlur';

/* ── animated number counter ── */
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let st: number | null = null;
    const raf = requestAnimationFrame(function tick(ts) {
      if (!st) st = ts;
      const p = Math.min((ts - st) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
}

const INDUSTRIES = [
  { icon: '⊞', label: 'HOSPITALITY' },
  { icon: '◇', label: 'LUXURY' },
  { icon: '⌥', label: 'TECH' },
  { icon: '⌂', label: 'REAL ESTATE' },
  { icon: '▭', label: 'FINTECH' },
  { icon: '⬡', label: 'FMCG' },
  { icon: '⊕', label: 'CULTURE' },
];

export default function USPSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);

  const c1 = useCounter(100, 1800, go);
  const c2 = useCounter(8, 1800, go);
  const c3 = useCounter(1000, 1800, go);

  /* reveal on scroll */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setGo(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  /* responsive scaling of the fixed 1000×470 scene */
  useLayoutEffect(() => {
    const zone = zoneRef.current;
    const scene = sceneRef.current;
    if (!zone || !scene) return;
    const apply = () => {
      // mobile uses a smaller logical scene → bigger effective elements
      const mobile = window.matchMedia('(max-width: 560px)').matches;
      const s = Math.min(zone.clientWidth / (mobile ? 480 : 1000), 1.04);
      scene.style.setProperty('--s', String(s));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(zone);
    return () => ro.disconnect();
  }, []);

  // helper: build className for a floating element on a given curve
  const el = (curve: 'outer' | 'inner', lane: string, upright = false) =>
    [styles.trav, styles[curve], styles[lane], upright ? styles.upright : '', go ? styles.show : '']
      .filter(Boolean).join(' ');

  return (
    <section className={styles.section} ref={sectionRef}>

      {/* ── Arc scene ── */}
      <div className={styles.arcZone} ref={zoneRef}>
        <div className={styles.scene} ref={sceneRef}>
          <svg className={styles.arcSvg} aria-hidden>
            <path
              className={`${styles.arcPath} ${styles.arcOuter} ${go ? styles.arcDraw : ''}`}
              d="M 50 430 A 450 380 0 0 1 950 430"
            />
            <path
              className={`${styles.arcPath} ${styles.arcThird} ${go ? styles.arcDraw : ''}`}
              d="M 170 430 A 330 270 0 0 1 830 430"
            />
            <path
              className={`${styles.arcPath} ${styles.arcInner} ${go ? styles.arcDraw : ''}`}
              d="M 170 430 A 330 270 0 0 1 830 430"
            />
          </svg>

          {/* ── OUTER arc — drift one way ── */}
          <div className={el('outer', 'lProjects', true)}>
            <div className={styles.badgeGreen}><span className={styles.chk}>✓</span><span className={styles.lbl}>Projects Delivered</span></div>
          </div>
          <div className={el('outer', 'lLighthouse')}>
            <div className={styles.imgCard} style={{ backgroundImage: 'url(/tree.png)' }} />
          </div>
          <div className={el('outer', 'lBrands', true)}>
            <div className={styles.badge}><span className={styles.userDot} /><span className={styles.lbl}>100+ Brand Projects</span></div>
          </div>
          <div className={el('outer', 'lYears', true)}>
            <div className={styles.badge}><span className={styles.heartDot} /><span className={styles.lbl}>8+ Years Experience</span></div>
          </div>
          <div className={el('outer', 'lDark')}>
            <div className={styles.avatarDark} style={{ backgroundImage: 'url(/anime-guy.png)' }} />
          </div>
          <div className={el('outer', 'lIndustries', true)}>
            <div className={styles.badge}><span className={styles.badgeEmoji}>💬</span><span className={styles.lbl}>20+ Industries</span></div>
          </div>

          {/* ── INNER arc — drift the opposite way ── */}
          <div className={el('inner', 'lPerfume')}>
            <div className={styles.imgCircle} style={{ backgroundImage: 'url(/arg-perfume.png)' }} />
          </div>
          <div className={el('inner', 'lAssets', true)}>
            <div className={styles.badge}><span className={styles.badgeEmoji}>👍</span><span className={styles.lbl}>1000+ Assets</span></div>
          </div>
          <div className={el('inner', 'lCenter')}>
            <div className={styles.avatarCenter} style={{ backgroundImage: 'url(/f1-sunset.png)' }} />
          </div>
          <div className={el('inner', 'lRiixo')}>
            <div className={styles.imgCard} style={{ backgroundImage: 'url(/friends.png)' }} />
          </div>
          <div className={el('inner', 'lCheck')}>
            <div className={styles.checkCircle}>✓</div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.stats}>
        <div className={styles.statCol}>
          <div className={styles.statNum}><span>{c1}</span><span className={styles.plus}>+</span></div>
          <div className={styles.statLbl}><TextAnimateBlur text="BRAND PROJECTS" stagger={60} duration={600} /></div>
          <div className={styles.statDsc}><TextAnimateBlur text="Brand identities, digital experiences and creative systems delivered." stagger={40} duration={600} /></div>
        </div>
        <div className={styles.statSep} />
        <div className={styles.statCol}>
          <div className={styles.statNum}><span>{c2}</span><span className={styles.plus}>+</span></div>
          <div className={styles.statLbl}><TextAnimateBlur text="YEARS EXPERIENCE" stagger={60} duration={600} /></div>
          <div className={styles.statDsc}><TextAnimateBlur text="Leading brands and teams from strategy to execution." stagger={40} duration={600} /></div>
        </div>
        <div className={styles.statSep} />
        <div className={styles.statCol}>
          <div className={styles.statNum}><span>{c3}</span><span className={styles.plus}>+</span></div>
          <div className={styles.statLbl}><TextAnimateBlur text="CREATIVE ASSETS" stagger={60} duration={600} /></div>
          <div className={styles.statDsc}><TextAnimateBlur text="Motion, print, digital and brand collateral produced." stagger={40} duration={600} /></div>
        </div>
      </div>

      {/* ── Industry tags ── */}
      <div className={styles.tagsRow}>
        {INDUSTRIES.map(({ icon, label }) => (
          <div key={label} className={styles.tag}>
            <span className={styles.tagIcon}>{icon}</span>{label}
          </div>
        ))}
      </div>

    </section>
  );
}
