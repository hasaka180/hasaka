'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Preloader.module.css'

const WORDS = "Hi, I'm Hasaka. Welcome to a new dawn of creativity.".split(' ')

export default function Preloader() {
  const [done, setDone] = useState(false)
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [leaving, setLeaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('hasaka-intro') === '1') {
      setDone(true)
      return
    }
    setMounted(true)
    document.body.style.overflow = 'hidden'

    let loaded = document.readyState === 'complete'
    let minElapsed = false

    const startExit = () => {
      if (started.current) return
      started.current = true
      setPhase('out')
      setTimeout(() => setLeaving(true), 1100)
      setTimeout(() => {
        setDone(true)
        document.body.style.overflow = ''
        sessionStorage.setItem('hasaka-intro', '1')
      }, 1900)
    }
    const maybeExit = () => { if (loaded && minElapsed) startExit() }

    const onLoad = () => { loaded = true; maybeExit() }
    window.addEventListener('load', onLoad)

    // hold until the dramatic reveal finishes AND the page has loaded
    const minT = setTimeout(() => { minElapsed = true; maybeExit() }, 3400)
    // safety cap so it never hangs on very slow media
    const maxT = setTimeout(startExit, 8000)

    return () => {
      window.removeEventListener('load', onLoad)
      clearTimeout(minT)
      clearTimeout(maxT)
      document.body.style.overflow = ''
    }
  }, [])

  if (done || !mounted) return null

  return (
    <div className={`${styles.overlay} ${leaving ? styles.leaving : ''}`} aria-hidden>
      <p className={styles.text}>
        {WORDS.map((w, i) => (
          <span
            key={i}
            className={phase === 'out' ? styles.out : styles.in}
            style={{ animationDelay: phase === 'out' ? `${i * 0.05}s` : `${0.3 + i * 0.17}s` }}
          >
            {w}&nbsp;
          </span>
        ))}
      </p>
    </div>
  )
}
