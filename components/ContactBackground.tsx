'use client'

import { useEffect, useRef } from 'react'
import styles from './ContactBackground.module.css'

/**
 * Dark particle field that brightens to a warm glow around the cursor.
 * Pure 2D canvas — captures the "peel back / light up the terrain" feel
 * from the reference without a WebGL dependency.
 */
export default function ContactBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const SPACING = 30
    const RADIUS = 210

    let w = 0
    let h = 0
    let dots: { x: number; y: number; b: number }[] = []
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 }

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = []
      for (let y = 0; y <= h + SPACING; y += SPACING) {
        for (let x = 0; x <= w + SPACING; x += SPACING) {
          // layered sine → soft organic "ridges" of brightness
          const n =
            (Math.sin(x * 0.012 + y * 0.006) + Math.sin(x * 0.005 - y * 0.014)) * 0.5
          const b = Math.max(0, (n + 1) / 2)
          dots.push({
            x: x + (Math.random() - 0.5) * SPACING * 0.55,
            y: y + (Math.random() - 0.5) * SPACING * 0.55,
            b,
          })
        }
      }
    }

    const draw = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.12
      mouse.y += (mouse.ty - mouse.y) * 0.12
      ctx.clearRect(0, 0, w, h)

      const mx = mouse.x
      const my = mouse.y
      for (const d of dots) {
        const dx = d.x - mx
        const dy = d.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const t = Math.max(0, 1 - dist / RADIUS)
        const e = t * t * (3 - 2 * t) // smoothstep

        const baseA = 0.05 + d.b * 0.12
        const alpha = Math.min(baseA + e * 0.92, 1)
        const r = 190 + e * (255 - 190)
        const g = 168 + d.b * 14 + e * (148 - 168)
        const bl = 140 + e * (60 - 140)
        const size = 0.8 + d.b * 0.7 + e * 2.4

        ctx.beginPath()
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${bl | 0},${alpha})`
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // soft ambient glow under the cursor
      if (mx > -1000) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, RADIUS)
        grad.addColorStop(0, 'rgba(255,140,50,0.13)')
        grad.addColorStop(1, 'rgba(255,140,50,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      raf = requestAnimationFrame(draw)
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.tx = e.clientX - rect.left
      mouse.ty = e.clientY - rect.top
    }
    const onLeave = () => {
      mouse.tx = -9999
      mouse.ty = -9999
    }

    let raf = 0
    build()
    if (reduce) {
      draw()
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', build)
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', build)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
}
