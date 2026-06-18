'use client'

import { useEffect, useRef, useState } from 'react'

const SRC_DESKTOP = '/videos/hero-video.mp4'
const SRC_MOBILE = '/videos/hero-video-mob.mp4'
const SENSITIVITY = 0.8

/** Services hero video.
 *  Desktop: mouse-scrubbed timeline. Mobile: autoplaying loop (no cursor to scrub). */
export default function ScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [ready, setReady] = useState(false)

  // decide viewport before loading a video (so we only fetch the right one)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    setReady(true)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // desktop only: scrub the timeline with horizontal mouse movement
  useEffect(() => {
    if (!ready || isMobile) return
    const video = videoRef.current
    if (!video) return

    let prevX: number | null = null
    let targetTime = 0
    let seeking = false

    const applySeek = () => {
      seeking = true
      video.currentTime = targetTime
    }
    const onSeeked = () => {
      if (Math.abs(video.currentTime - targetTime) > 0.01) applySeek()
      else seeking = false
    }
    const onMove = (e: MouseEvent) => {
      const duration = video.duration
      if (!duration || Number.isNaN(duration)) return
      if (prevX === null) { prevX = e.clientX; return }
      const delta = e.clientX - prevX
      prevX = e.clientX
      const offset = (delta / window.innerWidth) * SENSITIVITY * duration
      targetTime = Math.min(Math.max(targetTime + offset, 0), duration)
      if (!seeking) applySeek()
    }

    video.addEventListener('seeked', onSeeked)
    window.addEventListener('mousemove', onMove)
    return () => {
      video.removeEventListener('seeked', onSeeked)
      window.removeEventListener('mousemove', onMove)
    }
  }, [ready, isMobile])

  const src = isMobile ? SRC_MOBILE : SRC_DESKTOP

  return (
    <video
      ref={videoRef}
      key={src} // remount when the source switches so autoplay applies cleanly
      className="absolute inset-0 z-0 w-full h-full object-cover"
      style={{ objectPosition: '70% center' }}
      muted
      playsInline
      preload={ready ? 'auto' : 'none'}
      autoPlay={isMobile}
      loop={isMobile}
      src={src}
    />
  )
}
