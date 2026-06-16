'use client'

import { useState, useRef, useEffect } from 'react'

type Step = 'name' | 'project' | 'done'

export default function HireChat() {
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [project, setProject] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (step !== 'name') {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [step])

  const handleName = () => {
    const val = name.trim() || 'there'
    setSubmittedName(val)
    setStep('project')
  }

  const handleProject = () => {
    setStep('done')
  }

  return (
    <div className="hirepg">
      <div className="chatwrap">
        <div className="chsend">
          <div className="chav">H</div>
          Hasaka <span className="crl">Creative Director &amp; Brand Architect</span>
        </div>

        <div className="bubs">
          <div className="bub">Hello, hello 🙂</div>
          <div className="bub">I&apos;m Hasaka 👋</div>
        </div>

        <div className="chyou">You</div>
        <div className="bubs">
          <div className="bub r">👋</div>
          <div className="bub r">Nice to meet you, Hasaka!</div>
        </div>

        {/* Step: name submitted */}
        {(step === 'project' || step === 'done') && (
          <div className="bubs">
            <div className="bub r">{submittedName}</div>
          </div>
        )}

        {/* Step: project submitted */}
        {step === 'done' && project && (
          <div className="bubs">
            <div className="bub r">{project}</div>
          </div>
        )}

        {/* Active card */}
        <div ref={cardRef} className="chcard" id="chcard">
          {step === 'name' && (
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
          )}

          {step === 'project' && (
            <>
              <label htmlFor="chi2">Tell me about your project</label>
              <input
                className="chinp"
                type="text"
                id="chi2"
                placeholder="I need a brand identity for..."
                value={project}
                onChange={(e) => setProject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProject()}
                autoFocus
                autoComplete="off"
              />
              <div className="chok" onClick={handleProject}>OK &nbsp;⇥</div>
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: 14 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>✅</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                Got it! I&apos;ll be in touch at hello@hasaka.io
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', fontSize: 26, marginTop: 8 }}>😊</div>
      </div>
    </div>
  )
}
