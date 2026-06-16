'use client'

import { useEffect, useRef, useState } from 'react'

const BASE_IMG = '/contact1.jpg'
const REVEAL_IMG = '/contact2.jpeg'

const SPOTLIGHT_R = 260

/** Cursor-following spotlight that reveals REVEAL_IMG through a soft circular
 *  mask layered over BASE_IMG. */
export default function SpotlightReveal() {
  const [cursor, setCursor] = useState({ x: -999, y: -999 })

  useEffect(() => {
    const IDLE_DELAY = 2500 // ms of no movement before the spotlight auto-drifts

    const raw = { x: -999, y: -999 }
    const smooth = { x: -999, y: -999 }
    let lastMove = -Infinity // start idle → autoplay on load until first move

    const onMove = (e: MouseEvent) => {
      raw.x = e.clientX
      raw.y = e.clientY
      lastMove = performance.now()
    }
    window.addEventListener('mousemove', onMove)

    let rafId = 0
    const loop = (now: number) => {
      // when idle, steer the target along a smooth looping (Lissajous) path
      if (now - lastMove > IDLE_DELAY) {
        const t = now * 0.001
        const w = window.innerWidth
        const h = window.innerHeight
        raw.x = w * 0.5 + Math.sin(t * 0.55) * w * 0.33
        raw.y = h * 0.5 + Math.sin(t * 0.83 + 1.1) * h * 0.3
      }
      smooth.x += (raw.x - smooth.x) * 0.1
      smooth.y += (raw.y - smooth.y) * 0.1
      setCursor({ x: smooth.x, y: smooth.y })
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section className="relative w-full h-[100dvh] bg-black overflow-hidden">
      <div
        className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat motion-safe:animate-kenburns"
        style={{ backgroundImage: `url(${BASE_IMG})` }}
      />
      <RevealLayer cursorX={cursor.x} cursorY={cursor.y} />
    </section>
  )
}

function RevealLayer({ cursorX, cursorY }: { cursorX: number; cursorY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mask, setMask] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const g = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.4, 'rgba(255,255,255,1)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    g.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    g.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2)
    ctx.fill()

    setMask(canvas.toDataURL())
  }, [cursorX, cursorY])

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div
        className="absolute inset-0 z-30 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${REVEAL_IMG})`,
          maskImage: mask ? `url(${mask})` : undefined,
          WebkitMaskImage: mask ? `url(${mask})` : undefined,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
      />
    </>
  )
}
