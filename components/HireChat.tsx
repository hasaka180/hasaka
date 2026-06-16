'use client'

import { useState, useRef, useEffect } from 'react'

type Msg = { from: 'you' | 'hasaka'; text: string }

export default function HireChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  // keep the latest message in view
  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

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

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { from: 'you', text }])
    setInput('')
    const c = typeof window !== 'undefined' ? window.$crisp : undefined
    if (c) c.push(['do', 'message:send', ['text', text]])
  }

  return (
    <div className="hirepg">
      <div className="chatwrap">
        <div className="chsend">
          <div className="chav">H</div>
          Hasaka <span className="crl">Creative Director &amp; Brand Architect</span>
        </div>

        {/* automated greeting */}
        <div className="bubs">
          <div className="bub">Hey there 👋</div>
          <div className="bub">Hope you&apos;re doing well today.</div>
          <div className="bub">How may I help you?</div>
        </div>

        {/* live conversation */}
        {messages.map((m, i) => (
          <div key={i} className="bubs">
            <div className={`bub${m.from === 'you' ? ' r' : ''}`}>{m.text}</div>
          </div>
        ))}

        {/* composer — visitor types and sends */}
        <div ref={endRef} className="chcard" id="chcard">
          <label htmlFor="chi">Message</label>
          <input
            className="chinp"
            type="text"
            id="chi"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            autoComplete="off"
          />
          <div className="chok" onClick={send}>Send &nbsp;⇥</div>
        </div>

        <div style={{ textAlign: 'right', fontSize: 26, marginTop: 8 }}>😊</div>
      </div>
    </div>
  )
}
