'use client'

import { useEffect, useState } from 'react'
import styles from './Preloader.module.css'

const LETTERS = ['H', 'A', 'S', 'A', 'K', 'A']

export default function Preloader() {
  // shown only on the very first load of a session
  const [done, setDone] = useState(false)
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

    // letters finish ~ 6 * 130ms + 0.5s ease ≈ 1.3s; hold, then exit
    const exit = setTimeout(() => setLeaving(true), 1900)
    const finish = setTimeout(() => {
      setDone(true)
      document.body.style.overflow = ''
      sessionStorage.setItem('hasaka-intro', '1')
    }, 2700)

    return () => {
      clearTimeout(exit)
      clearTimeout(finish)
      document.body.style.overflow = ''
    }
  }, [])

  if (done || !mounted) return null

  return (
    <div className={`${styles.overlay} ${leaving ? styles.leaving : ''}`} aria-hidden>
      <div className={styles.word}>
        {LETTERS.map((l, i) => (
          <span key={i} className={styles.letter} style={{ animationDelay: `${0.25 + i * 0.13}s` }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}
