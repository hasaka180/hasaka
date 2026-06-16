'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface Props {
  className?: string
  delay?: 1 | 2 | 3 | 4
  children: ReactNode
  tag?: keyof JSX.IntrinsicElements
}

export default function Reveal({ className = '', delay, children, tag: Tag = 'div' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in')
          io.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const delayClass = delay ? ` d${delay}` : ''
  const fullClass = `rv${delayClass}${className ? ` ${className}` : ''}`

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={fullClass}>
      {children}
    </Tag>
  )
}
