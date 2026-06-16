'use client'

import { useEffect, useRef } from 'react'

const SRC = '/videos/hero-video.mp4'
const SENSITIVITY = 0.8

/** Video background scrubbed by horizontal mouse movement.
 *  Does not autoplay — the timeline is driven entirely by the cursor. */
export default function ScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let prevX: number | null = null
    let targetTime = 0
    let seeking = false

    const applySeek = () => {
      seeking = true
      video.currentTime = targetTime
    }

    // queue the next seek only after the previous one finished → no flooding
    const onSeeked = () => {
      if (Math.abs(video.currentTime - targetTime) > 0.01) applySeek()
      else seeking = false
    }

    const onMove = (e: MouseEvent) => {
      const duration = video.duration
      if (!duration || Number.isNaN(duration)) return
      if (prevX === null) {
        prevX = e.clientX
        return
      }
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
  }, [])

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 z-0 w-full h-full object-cover"
      style={{ objectPosition: '70% center' }}
      muted
      playsInline
      preload="auto"
      src={SRC}
    />
  )
}
