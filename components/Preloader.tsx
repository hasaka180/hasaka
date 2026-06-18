'use client'

import { useEffect, useState } from 'react'
import styles from './Preloader.module.css'

const WORDS = "Hi, I'm Hasaka. Welcome to a new dawn of creativity.".split(' ')

export default function Preloader() {
  const [done, setDone] = useState(false)
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [leaving, setLeaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('hasaka-intro') === '1') {
      setDone(true)
      return
    }
    setMounted(true)
    document.body.style.overflow = 'hidden'

    const tOut = setTimeout(() => setPhase('out'), 2600)   // words blur out
    const tLeave = setTimeout(() => setLeaving(true), 3350) // overlay fades
    const tDone = setTimeout(() => {
      setDone(true)
      document.body.style.overflow = ''
      sessionStorage.setItem('hasaka-intro', '1')
    }, 4050)

    return () => {
      clearTimeout(tOut)
      clearTimeout(tLeave)
      clearTimeout(tDone)
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
            style={{
              animationDelay:
                phase === 'out' ? `${i * 0.045}s` : `${0.25 + i * 0.085}s`,
            }}
          >
            {w}&nbsp;
          </span>
        ))}
      </p>
    </div>
  )
}
