"use client";

import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./OrbitalHero.module.css";

gsap.registerPlugin(ScrollTrigger);

const LABELS = [
  { text: "Strategy",    angle: -70,  r: 255 },
  { text: "Interaction", angle: 15,   r: 270 },
  { text: "Motion",      angle: 95,   r: 258 },
  { text: "Storytelling",angle: 175,  r: 272 },
  { text: "Innovation",  angle: 245,  r: 260 },
  { text: "Experience",  angle: 310,  r: 265 },
];

// Elliptical rings: cx, cy = 350 centre in 700×700 viewBox
const RINGS = [
  { rx: 310, ry: 62,  rotate: -18, color: "rgba(180,200,255,0.35)", width: 0.8, dasharray: "" },
  { rx: 280, ry: 52,  rotate: -18, color: "rgba(220,80,60,0.55)",   width: 1.2, dasharray: "" },
  { rx: 250, ry: 44,  rotate: -18, color: "rgba(220,80,60,0.25)",   width: 0.6, dasharray: "4 6" },
  { rx: 330, ry: 70,  rotate: -18, color: "rgba(120,140,255,0.2)",  width: 0.5, dasharray: "2 8" },
];

// Deterministic star positions (avoids hydration mismatch)
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 137.508 + 23) % 700),
  y: ((i * 97.31  + 41) % 700),
  r: 0.6 + (i % 3) * 0.5,
  op: 0.2 + (i % 5) * 0.1,
}));

// Deterministic particles on ring path
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2;
  const rx = 285, ry = 54, tilt = -18 * (Math.PI / 180);
  const x = 350 + rx * Math.cos(angle) * Math.cos(tilt) - ry * Math.sin(angle) * Math.sin(tilt);
  const y = 350 + rx * Math.cos(angle) * Math.sin(tilt) + ry * Math.sin(angle) * Math.cos(tilt);
  const size = 1 + (i % 3);
  return { x, y, size };
});

export default function OrbitalHero() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const bgGlow1Ref   = useRef<HTMLDivElement>(null);
  const bgGlow2Ref   = useRef<HTMLDivElement>(null);
  const bgGlow3Ref   = useRef<HTMLDivElement>(null);
  const sphereRef    = useRef<HTMLDivElement>(null);
  const ringRefs     = useRef<(SVGEllipseElement | null)[]>([]);
  const labelRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<HTMLDivElement>(null);
  const starsRef     = useRef<SVGSVGElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const rotGroupRef  = useRef<SVGGElement>(null);
  const progressDotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "bottom top",
          scrub: 1.8,
        },
      });

      // 0–8%: fade in stars + bg atmosphere
      tl.to(starsRef.current, { opacity: 1, duration: 0.08 }, 0)
        .to([bgGlow1Ref.current, bgGlow2Ref.current, bgGlow3Ref.current],
          { opacity: 1, duration: 0.12, stagger: 0.03 }, 0);

      // 8–20%: sphere appears + pulses in
      tl.to(sphereRef.current, { opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }, 0.08)
        .fromTo(sphereRef.current, { scale: 0.6 }, { scale: 1, duration: 0.12 }, 0.08);

      // 20–38%: rings appear one by one
      RINGS.forEach((_, i) => {
        const start = 0.2 + i * 0.045;
        tl.fromTo(
          ringRefs.current[i],
          { opacity: 0, attr: { "stroke-dashoffset": 2000 } },
          { opacity: 1, attr: { "stroke-dashoffset": 0 }, duration: 0.1, ease: "power1.out" },
          start
        );
      });

      // 38–48%: particles fade in
      tl.to(particlesRef.current, { opacity: 1, duration: 0.1 }, 0.38);

      // 48–55%: progress dots appear
      tl.to(progressRef.current, { opacity: 1, duration: 0.05 }, 0.48);

      // 52–95%: labels appear sequentially
      LABELS.forEach((_, i) => {
        const start = 0.52 + i * 0.072;
        tl.fromTo(
          labelRefs.current[i],
          { opacity: 0, x: i % 2 === 0 ? -12 : 12 },
          { opacity: 1, x: 0, duration: 0.08, ease: "power2.out" },
          start
        );
        // light up progress dot
        tl.to(progressDotRefs.current[i],
          { backgroundColor: "rgba(220,100,80,0.9)", boxShadow: "0 0 6px rgba(220,100,80,0.6)", duration: 0.04 },
          start + 0.04
        );
      });

      // Continuous slow rotation throughout (scrubbed)
      tl.to(rotGroupRef.current, { rotation: 360, transformOrigin: "350px 350px", ease: "none", duration: 1 }, 0);

    }, wrapper);

    // Continuous ambient rotation (not scroll-driven)
    const ambientRot = gsap.to(rotGroupRef.current, {
      rotation: 360,
      transformOrigin: "350px 350px",
      duration: 40,
      repeat: -1,
      ease: "none",
      paused: false,
    });

    return () => {
      ctx.revert();
      ambientRot.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Label positions
  const labelPositions = useMemo(() =>
    LABELS.map(({ angle, r }) => {
      const rad = angle * (Math.PI / 180);
      return {
        x: 350 + r * Math.cos(rad),
        y: 350 + r * Math.sin(rad),
        leftSide: Math.cos(rad) < 0,
      };
    }), []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.sticky}>

        {/* Background */}
        <div className={styles.bg}>
          <div className={styles.bgGlow} ref={bgGlow1Ref} style={{ position: "absolute", width: 700, height: 700, top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, rgba(80,20,10,0.6) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className={styles.bgGlow} ref={bgGlow2Ref} style={{ position: "absolute", width: 900, height: 500, bottom: -100, left: "50%", transform: "translateX(-50%)", background: "radial-gradient(ellipse, rgba(20,30,100,0.5) 0%, transparent 70%)", filter: "blur(80px)", opacity: 0 }} />
          <div className={styles.bgGlow} ref={bgGlow3Ref} style={{ position: "absolute", width: 500, height: 500, top: "10%", right: "10%", background: "radial-gradient(circle, rgba(60,20,80,0.35) 0%, transparent 70%)", filter: "blur(80px)", opacity: 0 }} />
        </div>

        <div className={styles.scene}>

          {/* Stars */}
          <svg ref={starsRef} className={styles.stars} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0 }} viewBox="0 0 700 700">
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`rgba(255,255,255,${s.op})`} />
            ))}
          </svg>

          {/* SVG rings */}
          <svg className={styles.ringsSvg} viewBox="0 0 700 700" overflow="visible">
            <g ref={rotGroupRef}>
              {RINGS.map((ring, i) => (
                <ellipse
                  key={i}
                  ref={(el) => { ringRefs.current[i] = el; }}
                  cx={350} cy={350}
                  rx={ring.rx} ry={ring.ry}
                  stroke={ring.color}
                  strokeWidth={ring.width}
                  strokeDasharray={ring.dasharray || `${Math.PI * 2 * ring.rx} ${Math.PI * 2 * ring.rx}`}
                  strokeDashoffset={Math.PI * 2 * ring.rx}
                  fill="none"
                  transform={`rotate(${ring.rotate}, 350, 350)`}
                  style={{ filter: i === 1 ? "drop-shadow(0 0 4px rgba(220,80,60,0.6))" : "none" }}
                  opacity={0}
                />
              ))}

              {/* Ring particle dots */}
              {PARTICLES.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x} cy={p.y}
                  r={p.size * 0.7}
                  fill={`rgba(220,160,140,${0.15 + (i % 4) * 0.08})`}
                />
              ))}
            </g>

            {/* Thin orbit line across sphere equator */}
            <ellipse
              cx={350} cy={350}
              rx={148} ry={20}
              stroke="rgba(180,210,255,0.2)"
              strokeWidth={0.6}
              fill="none"
              transform="rotate(-18, 350, 350)"
              ref={(el) => { ringRefs.current[4] = el; }}
              opacity={0}
            />

            {/* Glowing orbit ring highlight */}
            <ellipse
              cx={350} cy={350}
              rx={280} ry={52}
              stroke="rgba(220,80,60,0.7)"
              strokeWidth={0.5}
              fill="none"
              transform="rotate(-18, 350, 350)"
              style={{ filter: "blur(1px) drop-shadow(0 0 6px rgba(220,60,40,0.8))" }}
              ref={(el) => { ringRefs.current[5] = el; }}
              opacity={0}
            />
          </svg>

          {/* Central sphere */}
          <div className={styles.sphereWrap} ref={sphereRef} style={{ opacity: 0 }}>
            <div className={styles.sphere}>
              <div className={styles.sphereSheen} />
              <div className={styles.sphereRim} />
            </div>
          </div>

          {/* Particles layer */}
          <div className={styles.particles} ref={particlesRef}>
            {Array.from({ length: 14 }, (_, i) => {
              const angle = (i / 14) * Math.PI * 2;
              const r = 160 + (i % 3) * 40;
              return (
                <div
                  key={i}
                  className={styles.particle}
                  style={{
                    left: `${50 + (r / 700) * 100 * Math.cos(angle)}%`,
                    top:  `${50 + (r / 700) * 100 * Math.sin(angle)}%`,
                    width: 2 + (i % 3),
                    height: 2 + (i % 3),
                    opacity: 0.3 + (i % 4) * 0.12,
                    boxShadow: `0 0 ${4 + (i % 3) * 2}px rgba(220,160,120,0.6)`,
                    transform: "translate(-50%,-50%)",
                  }}
                />
              );
            })}
          </div>

          {/* Labels */}
          <div className={styles.labelsWrap}>
            {LABELS.map((label, i) => {
              const pos = labelPositions[i];
              return (
                <div
                  key={i}
                  className={styles.label}
                  ref={(el) => { labelRefs.current[i] = el; }}
                  style={{
                    left: `${(pos.x / 700) * 100}%`,
                    top:  `${(pos.y / 700) * 100}%`,
                    flexDirection: pos.leftSide ? "row-reverse" : "row",
                  }}
                >
                  <div className={styles.labelDot} />
                  <div className={styles.labelLine} style={{
                    background: pos.leftSide
                      ? "linear-gradient(to left, rgba(220,140,120,0.8), transparent)"
                      : "linear-gradient(to right, rgba(220,140,120,0.8), transparent)"
                  }} />
                  <div className={styles.labelText}>{label.text}</div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Progress dots */}
        <div className={styles.progress} ref={progressRef}>
          {LABELS.map((_, i) => (
            <div
              key={i}
              className={styles.progressDot}
              ref={(el) => { progressDotRefs.current[i] = el; }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
