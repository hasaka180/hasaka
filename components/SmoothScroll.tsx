'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Site-wide Lenis smooth scroll, synced with GSAP ScrollTrigger so the
 *  pinned hero + DesignPractice ring stay in step with the smoothed scroll. */
export default function SmoothScroll() {
  useEffect(() => {
    // Skip on devices/users that prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const onTick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(onTick)
      lenis.destroy()
    }
  }, [])

  return null
}
