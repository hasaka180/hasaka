'use client'

import { useState, useRef, useEffect } from 'react'

type Msg = { from: 'you' | 'hasaka'; text: string }

export default function HireChat() {
  const [started, setStarted] = useState(false)
  const [name, setName] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  // keep the latest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, started])

  // stream operator replies (sent from the Crisp iOS app) into this UI
  useEffect(() => {
    const c = typeof window !== 'undefined' ? window.$crisp : undefined
    if (!c) return
    const onReceived = (msg: { type?: string; content?: unknown } | undefined) => {
      if (msg?.type === 'text' && typeof msg.content === 'string') {
        setMessages((m) => [...m, { from: 'hasaka', text: msg.content as string }])
      }
    }
    c.push(['on', 'message:received', onReceived])
    return () => { try { c.push(['off', 'message:received']) } catch { /* noop */ } }
  }, [])

  const crispOn = () => (typeof window !== 'undefined' ? window.$crisp : undefined)

  const handleName = () => {
    const val = name.trim() || 'there'
    setSubmittedName(val)
    const c = crispOn()
    if (c) c.push(['set', 'user:nickname', [val]])
    setStarted(true)
    setMessages([{ from: 'hasaka', text: `Great to meet you, ${val}! What are you working on?` }])
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { from: 'you', text }])
    setInput('')
    const c = crispOn()
    if (c) {
      c.push(['do', 'message:send', ['text', text]])
    } else {
      // Crisp not configured → graceful fallback
      setTimeout(() => setMessages((m) => [...m, { from: 'hasaka', text: "Thanks! I'll get back to you at hello@hasaka.io" }]), 500)
    }
  }

  return (
    <div className="hirepg">
      <div className="chatwrap">
        <div className="chsend">
          <div className="chav">H</div>
          Hasaka <span className="crl">Creative Director &amp; Brand Architect</span>
        </div>

        {/* intro */}
        <div className="bubs">
          <div className="bub">Hello, hello 🙂</div>
          <div className="bub">I&apos;m Hasaka 👋</div>
        </div>

        <div className="chyou">You</div>
        <div className="bubs">
          <div className="bub r">👋</div>
          <div className="bub r">Nice to meet you, Hasaka!</div>
        </div>

        {/* once started, the name shows as the visitor's reply */}
        {started && (
          <div className="bubs">
            <div className="bub r">{submittedName}</div>
          </div>
        )}

        {/* live conversation */}
        {messages.map((m, i) => (
          <div key={i} className="bubs">
            <div className={`bub${m.from === 'you' ? ' r' : ''}`}>{m.text}</div>
          </div>
        ))}

        {/* composer */}
        <div ref={endRef} className="chcard" id="chcard">
          {!started ? (
            <>
              <label htmlFor="chi">My name is</label>
              <input
                className="chinp"
                type="text"
                id="chi"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleName()}
                autoComplete="off"
              />
              <div className="chok" onClick={handleName}>OK &nbsp;⇥</div>
            </>
          ) : (
            <>
              <label htmlFor="chi2">Message</label>
              <input
                className="chinp"
                type="text"
                id="chi2"
                placeholder="Type your message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                autoFocus
                autoComplete="off"
              />
              <div className="chok" onClick={send}>Send &nbsp;⇥</div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'right', fontSize: 26, marginTop: 8 }}>😊</div>
      </div>
    </div>
  )
}
