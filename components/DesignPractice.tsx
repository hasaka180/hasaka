"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./DesignPractice.module.css";

gsap.registerPlugin(ScrollTrigger);

// SVG canvas 1000×1000, ring sits at centre with radius 210
const CX = 500, CY = 500, R = 210;
const CIRCUMFERENCE = 2 * Math.PI * R;

// 6 nodes evenly at 60° apart, starting top (-90°)
const NODES = [
  {
    num: "01", numColor: "#8aab58",
    title: "Research\n& Insight",
    desc: "Understanding people, market and context to uncover real opportunities.",
    angle: -90,   // top         0 %
  },
  {
    num: "02", numColor: "#7a8fb0",
    title: "Strategy\n& Direction",
    desc: "Defining the right problems to solve and a clear path forward.",
    angle: -30,   // top-right  16.7 %
  },
  {
    num: "03", numColor: "#6080a8",
    title: "Concept\n& Ideation",
    desc: "Exploring creative ideas and turning concepts into clear directions.",
    angle: 30,    // bottom-right 33.3 %
  },
  {
    num: "04", numColor: "#9878b0",
    title: "Design\n& Craft",
    desc: "Crafting elegant, intuitive and impactful experiences with attention to detail.",
    angle: 90,    // bottom       50 %
  },
  {
    num: "05", numColor: "#c07898",
    title: "Build\n& Collaborate",
    desc: "Bringing ideas to life through collaboration, iteration and craftsmanship.",
    angle: 150,   // bottom-left  66.7 %
  },
  {
    num: "06", numColor: "#c09050",
    title: "Launch\n& Evolve",
    desc: "Launching with purpose nand continuously improving based on real impact.",
    angle: 210,   // top-left     83.3 %
  },
];

// angle where -90°=top, 0°=right, 90°=bottom
function ringPoint(angleDeg: number) {
  const rad = angleDeg * (Math.PI / 180);
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

// Fraction of arc (0→1) at which the tip reaches this node
function nodeFraction(angleDeg: number) {
  return ((angleDeg + 90 + 360) % 360) / 360;
}

// Text alignment per quadrant
function labelAlign(angleDeg: number): "left" | "right" | "center" {
  if (angleDeg === -90 || angleDeg === 90) return "center";
  if (angleDeg > -90 && angleDeg < 90) return "left";
  return "right";
}

export default function DesignPractice() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (arcRef.current) gsap.set(arcRef.current, { strokeDashoffset: CIRCUMFERENCE });
    if (tipRef.current) gsap.set(tipRef.current, { opacity: 0 });
    dotRefs.current.forEach(d => d && gsap.set(d, { opacity: 0, scale: 0, transformOrigin: "50% 50%" }));
    nodeRefs.current.forEach(n => n && gsap.set(n, { opacity: 0, y: 18 }));
    mobileItemRefs.current.forEach(n => n && gsap.set(n, { opacity: 0, y: 12 }));

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      tl.to(arcRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        duration: 1,
      }, 0);

      tl.to(tipRef.current, { opacity: 1, duration: 0.02 }, 0.01);

      const proxy = { progress: 0 };
      tl.to(proxy, {
        progress: 1,
        ease: "none",
        duration: 1,
        onUpdate() {
          const tip = tipRef.current;
          if (!tip) return;
          const angle = proxy.progress * 360 - 90;
          const rad = angle * (Math.PI / 180);
          tip.setAttribute("cx", String(CX + R * Math.cos(rad)));
          tip.setAttribute("cy", String(CY + R * Math.sin(rad)));
        },
      }, 0);

      if (scrollHintRef.current) {
        tl.to(scrollHintRef.current, { opacity: 0, duration: 0.04 }, 0.02);
      }

      NODES.forEach((node, i) => {
        const at = nodeFraction(node.angle) + 0.01;

        tl.to(dotRefs.current[i], {
          opacity: 1, scale: 1,
          duration: 0.03, ease: "back.out(1.8)",
        }, at);

        tl.to(nodeRefs.current[i], {
          opacity: 1, y: 0,
          duration: 0.06, ease: "power2.out",
        }, at);

        // mobile list items
        if (mobileItemRefs.current[i]) {
          tl.to(mobileItemRefs.current[i], {
            opacity: 1, y: 0,
            duration: 0.06, ease: "power2.out",
          }, at);
        }
      });
    }, wrapper);

    return () => { ctx.revert(); };
  }, []);

  const SCENE = 1000;
  const LABEL_R = R + 175;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.sticky}>

        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />

        <div className={styles.scene}>
          <svg className={styles.svg} viewBox={`0 0 ${SCENE} ${SCENE}`}>
            <defs>
              <linearGradient id="arcGrad" gradientUnits="userSpaceOnUse"
                x1={CX} y1={CY - R} x2={CX + R * 0.8} y2={CY + R * 0.6}>
                <stop offset="0%" stopColor="#8957D8" />
                <stop offset="40%" stopColor="#A95DBE" />
                <stop offset="80%" stopColor="#D9619D" />
                <stop offset="100%" stopColor="#EF6590" />
              </linearGradient>

              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>

              <filter id="tipGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>

              <filter id="dotGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>

              <radialGradient id="ringFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,245,235,0.55)" />
                <stop offset="100%" stopColor="rgba(242,239,233,0)" />
              </radialGradient>
            </defs>

            <circle cx={CX} cy={CY} r={R}
              fill="url(#ringFill)" stroke="none"
            />

            <circle cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(180,160,130,0.13)"
              strokeWidth="1"
            />

            <circle
              ref={arcRef}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="url(#arcGrad)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
              transform={`rotate(-90 ${CX} ${CY})`}
              filter="url(#arcGlow)"
            />

            <circle
              ref={tipRef}
              cx={CX} cy={CY - R}
              r={10}
              fill="white"
              opacity={0}
              filter="url(#tipGlow)"
            />

            {NODES.map((node, i) => {
              const pt = ringPoint(node.angle);
              return (
                <circle
                  key={i}
                  ref={el => { dotRefs.current[i] = el; }}
                  cx={pt.x} cy={pt.y} r={5}
                  fill="white"
                  opacity={0}
                  filter="url(#dotGlow)"
                />
              );
            })}
          </svg>

          <div className={styles.center}>
            <div className={styles.centerEyebrow}>Our Approach</div>
            <div className={styles.centerTitle}>Design<br />Framework</div>
            <div className={styles.centerDesc}>
              A human-centered, strategic process that transforms ideas into meaningful digital experiences.
            </div>
            <div className={styles.centerScroll} ref={scrollHintRef}>
              Scroll to explore
              <div className={styles.chevron} />
            </div>
          </div>

          {NODES.map((node, i) => {
            const rad = node.angle * (Math.PI / 180);
            const lx = (CX + LABEL_R * Math.cos(rad)) / SCENE * 100;
            const ly = (CY + LABEL_R * Math.sin(rad)) / SCENE * 100;
            const align = labelAlign(node.angle);
            return (
              <div
                key={i}
                className={styles.node}
                ref={el => { nodeRefs.current[i] = el; }}
                style={{ left: `${lx}%`, top: `${ly}%`, textAlign: align }}
              >
                <div className={styles.nodeNum} style={{ color: node.numColor }}>{node.num}</div>
                <div className={styles.nodeTitle}>
                  {node.title.split("\n").map((l, j) => (
                    <span key={j}>{l}{j === 0 && <br />}</span>
                  ))}
                </div>
                <div className={styles.nodeDesc}>
                  {node.desc.split("\n").map((l, j) => (
                    <span key={j}>{l}{j < node.desc.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile-only node list — hidden on desktop via CSS */}
        <div className={styles.mobileList}>
          {NODES.map((node, i) => (
            <div
              key={i}
              className={styles.mobileItem}
              ref={el => { mobileItemRefs.current[i] = el; }}
            >
              <div className={styles.mobileItemNum} style={{ color: node.numColor }}>{node.num}</div>
              <div className={styles.mobileItemText}>
                <div className={styles.mobileItemTitle}>
                  {node.title.replace("\n", " ")}
                </div>
                <div className={styles.mobileItemDesc}>{node.desc.replace(/\n/g, " ")}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
