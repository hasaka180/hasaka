"use client";

import { useEffect, useRef, useState } from "react";
import TextAnimateBlur from "./TextAnimateBlur";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

type MCard = { img?: string; label: string; sub: string; video?: string };

// 4 distinct project sets for the mobile carousels (no overlap between rows)
const ROW1: MCard[] = [
  { img: "/nexe.jpg", label: "Nexera Robotics", sub: "Tech Brand" },
  { img: "/lighthouse.jpg", label: "Lighthouse App", sub: "Tech Brand" },
  { img: "/summa-forte.jpg", label: "Summa Forte", sub: "Product Packaging" },
];
const ROW2: MCard[] = [
  { img: "/kaiju.jpg", label: "Cooking Guild", sub: "Product Packaging" },
  { img: "/sadara.jpg", label: "Sadara", sub: "Typography" },
  { img: "/rockypet.jpg", label: "Rocky Pet", sub: "Brand Identity" },
];
const ROW3: MCard[] = [
  { img: "/steggys.jpg", label: "Steggys", sub: "Brand Identity" },
  { img: "/riixo.jpg", label: "Riixo", sub: "Product Design" },
  { img: "/gathr.jpg", label: "Gathr", sub: "Packaging" },
];
const ROW4: MCard[] = [
  { img: "/mazyon.jpg", label: "Mazyon Chocolate", sub: "Brand Identity" },
  { img: "/scoutx.jpg", label: "ScoutX", sub: "UI/UX" },
  { video: "/videos/hero_reel.mp4", label: "Motion Art & Systems", sub: "Creative Direction" },
];

// One mobile carousel row. `dir` carries the direction/speed classes.
function MobileCarousel({ items, dir }: { items: MCard[]; dir: string }) {
  return (
    <div className={styles.carouselRow}>
      <div className={`${styles.carouselTrack} ${dir}`}>
        {[...items, ...items].map((card, i) => (
          <div key={i} className={styles.carouselCard} style={{ position: "relative", overflow: "hidden", background: "#111" }}>
            {card.video ? (
              <video src={card.video} autoPlay muted loop playsInline preload="none" poster={card.img} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <img src={card.img} alt={card.label} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
            <div className={styles.carouselCardSub} style={{ color: "rgba(255,255,255,0.55)", position: "relative", zIndex: 1 }}>{card.sub}</div>
            <div className={styles.carouselCardLabel} style={{ color: "#fff", position: "relative", zIndex: 1 }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const colLeftRef = useRef<HTMLDivElement>(null);
  const colRightRef = useRef<HTMLDivElement>(null);
  const colCenterRef = useRef<HTMLDivElement>(null);
  const colCenterTopRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const reelUIRef = useRef<HTMLDivElement>(null);
  const narrowPlayRef = useRef<HTMLDivElement>(null);
  const scrollArrowRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const captionPlayedRef = useRef(false);
  const [captionPlay, setCaptionPlay] = useState(false);
  const marqueeTweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    // --- Guard: only run on desktop ---
    if (window.innerWidth <= 768) return;

    const hero = heroRef.current;
    const colLeft = colLeftRef.current;
    const colRight = colRightRef.current;
    const colCenter = colCenterRef.current;
    const colCenterTop = colCenterTopRef.current;
    const caption = captionRef.current;
    const reelUI = reelUIRef.current;
    const narrowPlay = narrowPlayRef.current;
    const scrollArrow = scrollArrowRef.current;

    if (!hero || !colLeft || !colRight || !colCenter || !colCenterTop) return;

    function init() {
      const pad = 8;
      const vh = hero!.offsetHeight;
      const hw = hero!.offsetWidth;
      const midW = 210;
      const sideGap = 1;

      // Reset
      gsap.set(
        [colLeft, colRight, colCenter, colCenterTop,
          scrollArrow, caption, reelUI, narrowPlay],
        { clearProps: "all" }
      );

      // Centre position
      const centerX = hw / 2;
      const midLeft = centerX - midW / 2;

      // Heights
      const gapH = vh - pad * 3;
      const topH = gapH * 0.4;
      const botH = (vh - topH - pad * 3) * 0.88;

      gsap.set(colCenterTop, {
        left: midLeft, width: midW,
        top: pad, height: topH,
        borderRadius: 14, position: "absolute",
      });

      gsap.set(colCenter, {
        left: midLeft, width: midW,
        top: pad + topH + pad, height: botH,
        borderRadius: 14, position: "absolute",
      });

      const lw = colLeft!.offsetWidth;

      gsap.set(colLeft, { left: midLeft - sideGap - lw, position: "absolute" });
      gsap.set(colRight, { left: midLeft + midW + sideGap, position: "absolute" });

      gsap.set(scrollArrow, {
        top: pad + topH + pad + botH + 16,
        left: centerX, display: "flex", position: "absolute",
      });

      buildTimeline(lw, vh, hw, pad, midLeft, midW);
    }

    function buildTimeline(
      lw: number, vh: number, hw: number,
      pad: number, midLeft: number, midW: number
    ) {
      const captionH = 210;

      // Kill any existing trigger on this hero
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === hero) st.kill(true);
      });

      ctxRef.current = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "none" } });

        const leftCols = gsap.utils.toArray<HTMLElement>(colLeft!.children).reverse();
        const rightCols = gsap.utils.toArray<HTMLElement>(colRight!.children);

        // Left columns fly left + up
        leftCols.forEach((c, i) => {
          tl.to(c, { x: -(hw * 0.7) - i * 150, y: -180 - i * 60, opacity: 0, duration: 1 }, 0);
        });

        // Right columns fly right + up
        rightCols.forEach((c, i) => {
          tl.to(c, { x: (hw * 0.7) + i * 150, y: -180 - i * 60, opacity: 0, duration: 1 }, 0);
        });

        tl.to(colCenterTop, { y: -vh * 1.3, duration: 1 }, 0)
          .to(scrollArrow, { opacity: 0, scale: 0.8, duration: 0.3 }, 0)
          .to(colCenter, {
            left: hw * 0.23, width: hw * 0.54,
            top: captionH, height: vh - captionH - 120,
            borderRadius: 30, duration: 1,
          }, 0)
          .to(caption, { opacity: 1, ease: "power2.out", duration: 0.4 }, 0.5)
          .to(reelUI, { opacity: 1, ease: "power2.out", duration: 0.35 }, 0.6)
          .to(narrowPlay, { opacity: 0, ease: "power2.out", duration: 0.2 }, 0.5);

        // trigger the caption word-blur reveal once the scroll reaches it
        tl.call(() => {
          if (!captionPlayedRef.current) {
            captionPlayedRef.current = true;
            setCaptionPlay(true);
          }
        }, [], 0.5);

        ScrollTrigger.create({
          animation: tl,
          trigger: hero!,
          start: "top top",
          end: "+=220%",
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      }, hero!);
    }

    function startMarquees() {
      marqueeTweensRef.current.forEach((t) => t.kill());
      marqueeTweensRef.current = [];

      // col1=up, col2=down, col3=up | col4=down, col5=up, col6=down
      const leftInners = gsap.utils.toArray<HTMLElement>(
        colLeft!.querySelectorAll(`.${styles.colInner}`)
      );
      const rightInners = gsap.utils.toArray<HTMLElement>(
        colRight!.querySelectorAll(`.${styles.colInner}`)
      );

      const speeds = [18, 14, 22, 16, 20, 15]; // seconds per full loop
      const allInners = [...leftInners, ...rightInners];
      // directions: up=-50%, down=+50% start offset
      const dirs = [-1, 1, -1, 1, -1, 1]; // -1=up, 1=down

      allInners.forEach((inner, i) => {
        const dur = speeds[i] ?? 18;
        const dir = dirs[i];

        if (dir === -1) {
          // scroll upward: y from 0 → -50%
          gsap.set(inner, { y: 0 });
          const t = gsap.to(inner, {
            y: "-50%",
            duration: dur,
            ease: "none",
            repeat: -1,
          });
          marqueeTweensRef.current.push(t);
        } else {
          // scroll downward: y from -50% → 0
          gsap.set(inner, { y: "-50%" });
          const t = gsap.to(inner, {
            y: 0,
            duration: dur,
            ease: "none",
            repeat: -1,
          });
          marqueeTweensRef.current.push(t);
        }
      });
    }

    // Run after layout settles
    const raf = requestAnimationFrame(() => { init(); startMarquees(); });

    const handleResize = () => {
      ctxRef.current?.revert();
      marqueeTweensRef.current.forEach((t) => t.kill());
      marqueeTweensRef.current = [];
      init();
      startMarquees();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      marqueeTweensRef.current.forEach((t) => t.kill());
      marqueeTweensRef.current = [];
      ctxRef.current?.revert();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === hero) st.kill(true);
      });
    };
  }, []);

  useEffect(() => {
    const v1 = videoRef.current;
    const v2 = mobileVideoRef.current;

    const attemptPlay = (v: HTMLVideoElement) => {
      v.muted = true;
      v.defaultMuted = true;
      v.play().catch(() => {
        const retryPlay = () => {
          v.play();
          window.removeEventListener("mousedown", retryPlay);
          window.removeEventListener("touchstart", retryPlay);
        };
        window.addEventListener("mousedown", retryPlay);
        window.addEventListener("touchstart", retryPlay);
      });
    };

    // Small delay to ensure browser media engine is ready
    const timer = setTimeout(() => {
      if (v1) attemptPlay(v1);
      if (v2) attemptPlay(v2);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      id="home"
      aria-label="Brand work showcase"
    >
      {/* ═══ LEFT COLUMN GROUP ═══ */}
      <div className={styles.collageLeft} ref={colLeftRef}>

        {/* col 1 — marquee UP */}
        <div className={styles.col}>
          <div className={styles.colInner}>
            {[0, 1].map((k) => (
              <div key={k} className={styles.colStrip}>
                <div className={`${styles.cc} ${styles.navy}`} style={{ height: "58%", position: "relative", overflow: "hidden" }}>
                  <img src="/nexe.jpg" alt="Nexera Robotics" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 1 }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Tech Brand</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Nexera Robotics</div>
                  </div>
                </div>
                <div className={`${styles.cc} ${styles.coral}`} style={{ height: "42%", position: "relative", overflow: "hidden" }}>
                  <img src="/lighthouse.jpg" alt="Lighthouse App" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 1 }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Tech Brand</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Lighthouse App</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* col 2 — marquee DOWN */}
        <div className={styles.col}>
          <div className={styles.colInner}>
            {[0, 1].map((k) => (
              <div key={k} className={styles.colStrip}>
                <div className={`${styles.cc} ${styles.cream}`} style={{ flex: "0 0 calc(40% - 6px)", position: "relative", overflow: "hidden" }}>
                  <img src="/kaiju.jpg" alt="Cooking Guild" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Product Packaging</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Cooking Guild</div>
                  </div>
                </div>
                <div className={`${styles.cc} ${styles.oran}`} style={{ flex: "0 0 calc(35% - 6px)", position: "relative", overflow: "hidden" }}>
                  <video src="/videos/somo turismo.mp4" autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Lifestyle</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Somo Turismo</div>
                  </div>
                </div>
                <div className={`${styles.cc} ${styles.char}`} style={{ flex: "1 1 0", position: "relative", overflow: "hidden" }}>
                  <img src="/rockypet.jpg" alt="Rocky Pet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Brand Identity</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Rocky Pet</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* col 3 wide — marquee UP */}
        <div className={`${styles.col} ${styles.colWide}`}>
          <div className={styles.colInner}>
            {[0, 1].map((k) => (
              <div key={k} className={styles.colStrip}>
                <div className={`${styles.cc} ${styles.yell}`} style={{ height: "52%", position: "relative", overflow: "hidden" }}>
                  <img src="/summa-forte.jpg" alt="Summa Forte" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Product Packaging</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Summa Forte</div>
                  </div>
                </div>
                <div className={`${styles.cc}`} style={{ height: "48%", position: "relative", overflow: "hidden" }}>
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    src="/videos/realpha.mp4"
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Corporate Brand Identity</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Realpha</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CENTER TOP BLOCK ═══ */}
      <div className={styles.collageCenterTop} ref={colCenterTopRef}>
        <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", borderRadius: "inherit" }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            src="/videos/hero_reel.mp4"
          />
          {/* dark scrim so text stays readable */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Creative Direction</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 0.9 }}>MOTION ART<br />&amp; SYSTEMS</div>
          </div>
        </div>
      </div>

      {/* ═══ CENTER REEL BLOCK ═══ */}
      <div className={styles.collageCenter} ref={colCenterRef}>
        <div className={styles.reelBg} />
        <div className={`${styles.blob} ${styles.b1}`} />
        <div className={`${styles.blob} ${styles.b2}`} />
        <div className={`${styles.blob} ${styles.b3}`} />

        <video
          ref={videoRef}
          className={styles.reelVideo}
          src="/videos/brand-reel.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={(e) => e.currentTarget.play()}
          poster="/videos/brand-reel-poster.jpg"
        />

        <div className={styles.reelPlayNarrow} ref={narrowPlayRef}>
          <div className={styles.reelPlayNarrowArrow} />
        </div>
        <div className={styles.reelUi} ref={reelUIRef}>
          <div className={styles.reelTopRow}>
            <span className={styles.reelBadge}>Hasaka Studio · Brand Reel</span>
            <span className={styles.reelYear}>2024</span>
          </div>
          <div className={styles.reelCenterEl}>
            <div className={styles.reelWatermark}>HASAKA</div>
            <div className={styles.reelPlay}>
              <div className={styles.reelPlayArrow} />
            </div>
          </div>
          <div className={styles.reelBotRow}>
            <span className={styles.reelStudio}>100+ Projects · 8 Yrs</span>
            <a href="#contact" className={styles.reelCta}>
              <div className={styles.reelCtaDot} />
              Watch the reel
            </a>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT COLUMN GROUP ═══ */}
      <div className={styles.collageRight} ref={colRightRef}>

        {/* col 4 wide — marquee DOWN */}
        <div className={`${styles.col} ${styles.colWide}`}>
          <div className={styles.colInner}>
            {[0, 1].map((k) => (
              <div key={k} className={styles.colStrip}>
                <div className={`${styles.cc}`} style={{ flex: "0 0 calc(44% - 4px)", position: "relative", overflow: "hidden" }}>
                  <img src="/sadara.jpg" alt="Sadara" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Typography</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Sadara</div>
                  </div>
                </div>
                <div className={`${styles.cc}`} style={{ flex: "1 1 0", position: "relative", overflow: "hidden" }}>
                  <img src="/steggys.jpg" alt="Steggys" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Brand Identity</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Steggys</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* col 5 — marquee UP */}
        <div className={styles.col}>
          <div className={styles.colInner}>
            {[0, 1].map((k) => (
              <div key={k} className={styles.colStrip}>
                <div className={`${styles.cc}`} style={{ flex: "0 0 calc(33% - 6px)", position: "relative", overflow: "hidden" }}>
                  <img src="/riixo.jpg" alt="Riixo" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Product Design</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Riixo</div>
                  </div>
                </div>
                <div className={`${styles.cc}`} style={{ flex: "0 0 calc(33% - 6px)", position: "relative", overflow: "hidden" }}>
                  <video autoPlay muted loop playsInline preload="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} src="/videos/cardo.mp4" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>UI/UX</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Cardo</div>
                  </div>
                </div>
                <div className={`${styles.cc}`} style={{ flex: "1 1 0", position: "relative", overflow: "hidden" }}>
                  <video autoPlay muted loop playsInline preload="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} src="/videos/osos.mp4" />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Brand Identity</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Osos</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* col 6 — marquee DOWN */}
        <div className={styles.col}>
          <div className={styles.colInner}>
            {[0, 1].map((k) => (
              <div key={k} className={styles.colStrip}>
                <div className={`${styles.cc}`} style={{ flex: "0 0 calc(42% - 6px)", position: "relative", overflow: "hidden" }}>
                  <img src="/gathr.jpg" alt="Gathr" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Packaging</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Gathr</div>
                  </div>
                </div>
                <div className={`${styles.cc}`} style={{ flex: "0 0 calc(36% - 6px)", position: "relative", overflow: "hidden" }}>
                  <img src="/mazyon.jpg" alt="Mazyon Chocolate" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Brand Identity</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Mazyon Chocolate</div>
                  </div>
                </div>
                <div className={styles.cc} style={{ flex: "1 1 0", position: "relative", overflow: "hidden" }}>
                  <img src="/scoutx.jpg" alt="Scout" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)", zIndex: 1 }} />
                  <div style={{ position: "absolute", bottom: 10, left: 12, zIndex: 2 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>UI/UX</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>ScoutX</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CAPTION — fades in on scroll ═══ */}
      <div className={styles.heroCaption} ref={captionRef}>
        <h2>
          <TextAnimateBlur
            text={"Hasaka. A brand-first creative director.\n8 years building identities that outlive their moment."}
            play={captionPlay}
            stagger={70}
            duration={650}
          />
        </h2>
        <a href="#contact" className={styles.hireBtn}>✦ &nbsp;Work with me</a>
      </div>

      {/* ═══ SCROLL ARROW ═══ */}
      <a
        href="#about"
        className={`${styles.scrollArrow} ${styles.reelScrollBtn}`}
        ref={scrollArrowRef}
      >
        Scroll to work <span>↓</span>
      </a>

      {/* ═══ MOBILE ONLY: 4-row carousel + reel ═══ */}
      <div className={styles.mobileHero}>

        {/* ── Row 1: moves LEFT ── */}
        <MobileCarousel items={ROW1} dir={styles.scrollRight} />

        {/* ── Row 2: moves RIGHT ── */}
        <MobileCarousel items={ROW2} dir={styles.scrollLeft} />

        {/* ── Row 3: moves LEFT ── */}
        <MobileCarousel items={ROW3} dir={`${styles.scrollRight} ${styles.scrollSlow}`} />

        {/* ── Row 4: moves RIGHT ── */}
        <MobileCarousel items={ROW4} dir={`${styles.scrollLeft} ${styles.scrollSlow}`} />

        {/* ── Row 4: Reel / video block ── */}
        <div className={styles.mobileReelRow}>
          <div className={styles.mobileReelBg} />
          <div className={`${styles.blob} ${styles.b1}`} />
          <div className={`${styles.blob} ${styles.b2}`} />
          <div className={`${styles.blob} ${styles.b3}`} />

          {/* ← ADD THIS — replace the static play button */}
          <video
            ref={mobileVideoRef}
            className={styles.reelVideo}
            src="/videos/brand-reel.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            onCanPlay={(e) => e.currentTarget.play()}
            poster="/videos/brand-reel-poster.jpg"
          />

          <div className={styles.mobileReelTopRow}>
            <span className={styles.reelBadge}>Hasaka Studio · Brand Reel</span>
            <span className={styles.reelYear}>2024</span>
          </div>

          {/* keep the watermark + play button overlay on top */}
          <div className={styles.mobileReelCenter}>
            <div className={styles.reelWatermark}>HASAKA</div>
            <div className={styles.mobilePlayBtn}>
              <div className={styles.reelPlayArrow} />
            </div>
          </div>

          <div className={styles.mobileReelBotRow}>
            <span className={styles.reelStudio}>100+ Projects · 8 Yrs</span>
          </div>
        </div>

        {/* ── Mobile caption ── */}
        <div className={styles.mobileCaptionRow}>
          <h1><TextAnimateBlur text="Hasaka. A brand-first creative director. 8 years building identities that outlive their moment." stagger={70} duration={650} /></h1>
          <a href="#contact" className={styles.hireBtn}>✦ &nbsp;Work with me</a>
        </div>

      </div>
    </section>
  );
}
