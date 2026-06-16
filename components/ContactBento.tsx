'use client'

import { useEffect, useState } from 'react'

function useClock() {
  const [time, setTime] = useState('--:--')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        String(now.getHours()).padStart(2, '0') +
        ' ' +
        String(now.getMinutes()).padStart(2, '0')
      )
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function ContactBento() {
  const time = useClock()

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="bento">
        {/* Clock */}
        <div className="bn dk btm">
          <div className="tn">{time}</div>
          <div className="tlo">Dubai, UAE</div>
        </div>

        {/* Social */}
        <div className="bn dk bso">
          <div className="sogr">
            <div className="soi">Ig</div>
            <div className="soi">Bē</div>
            <div className="soi" style={{ fontSize: 10 }}>Git</div>
            <div className="soi">in</div>
            <div className="soi" style={{ fontSize: 10 }}>Dr.</div>
            <div className="soi" style={{ background: 'transparent' }}></div>
          </div>
          <div style={{ marginTop: 16, fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Available for projects
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 5, lineHeight: 1.5 }}>
            Mon — Fri<br />Sat — by request
          </div>
        </div>

        {/* Address */}
        <div className="bn dk bad">
          <div className="atit">Dubai,<br />United Arab Emirates</div>
          <div className="aln">Hasaka Studio<br />hello@hasaka.io</div>
          <div className="aop">Available 9 to 6</div>
          <div className="ahrs">Monday<br />Tuesday<br />Wednesday<br />Thursday<br />Friday</div>
        </div>

        {/* Map */}
        <div className="bn bma">
          <iframe
            className="mapframe"
            title="Al Quoz, Dubai"
            src="https://www.google.com/maps?q=Al%20Quoz%2C%20Dubai&z=14&output=embed"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="maptag">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5.5" r="2.2" stroke="#fff" strokeWidth="1.3" />
              <path d="M7 13.5C4.5 10 2 8.2 2 5.5a5 5 0 0110 0C12 8.2 9.5 10 7 13.5z" stroke="#fff" strokeWidth="1.3" fill="none" />
            </svg>
            Al Quoz, Dubai
          </div>
          <a
            className="mapdir"
            href="https://www.google.com/maps/search/?api=1&query=Al%20Quoz%2C%20Dubai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="dl">Directions</div>
            <div className="dl">Google Maps ↗</div>
          </a>
        </div>

        {/* Sound ring */}
        <div className="bn dk bsd">
          <div className="sring">
            <div className="sico">🔊</div>
          </div>
          <div className="slbl">How to say "Hasaka"?</div>
        </div>
      </div>

      <div className="cemr">
        <div className="ceb">
          <div className="cebl">
            <div className="cebt">Email</div>
            <div className="cebv">hello@hasaka.io</div>
          </div>
          <div className="cebic">✉</div>
        </div>
        <div className="ceb">
          <div className="cebl">
            <div className="cebt">Available for</div>
            <div className="cebv">Brand projects worldwide</div>
          </div>
          <div className="cebic">→</div>
        </div>
      </div>
    </div>
  )
}
