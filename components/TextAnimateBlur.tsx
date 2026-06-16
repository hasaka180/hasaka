"use client";

import { useRef, useEffect, useState } from "react";

interface Props {
  text: string;
  className?: string;
  delay?: number;       // ms delay before animation starts
  duration?: number;    // ms per word
  stagger?: number;     // ms between words
  play?: boolean;       // when provided, reveal is controlled externally (reveals once true)
}

export default function TextAnimateBlur({
  text,
  className,
  delay = 0,
  duration = 600,
  stagger = 80,
  play,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Externally controlled reveal (e.g. driven by a GSAP scroll timeline)
    if (play !== undefined) {
      if (play) setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [play]);

  // Support multi-line titles: "\n" becomes a <br/>; words stagger continuously.
  const lines = text.split("\n");
  let wordIndex = 0;

  return (
    <span ref={ref} className={className} style={{ display: "inline" }}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li}>
            {words.map((word, j) => {
              const i = wordIndex++;
              return (
                <span
                  key={`${li}-${j}`}
                  style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    opacity: visible ? 1 : 0,
                    filter: visible ? "blur(0px)" : "blur(8px)",
                    transform: visible ? "translateY(0)" : "translateY(10px)",
                    transition: visible
                      ? `opacity ${duration}ms ease, filter ${duration}ms ease, transform ${duration}ms ease`
                      : "none",
                    transitionDelay: visible ? `${delay + i * stagger}ms` : "0ms",
                  }}
                >
                  {word}{j < words.length - 1 ? " " : ""}
                </span>
              );
            })}
            {li < lines.length - 1 ? <br /> : null}
          </span>
        );
      })}
    </span>
  );
}
