'use client'

import { useEffect } from 'react'

const SERVER = process.env.NEXT_PUBLIC_CHAT_SERVER || 'wss://support.hasaka.io'

export default function HireChat() {
  useEffect(() => {
    // Only add the script once per page load
    if (document.getElementById('hasaka-chat-script')) return
    const script = document.createElement('script')
    script.id = 'hasaka-chat-script'
    script.src = '/hasaka-chat-light.js'
    script.dataset.server = SERVER
    script.dataset.name = 'Hasaka'
    script.dataset.role = 'Creative Director & Brand Architect'
    script.dataset.mode = 'inline'
    script.dataset.mount = '#hire-chat'
    document.body.appendChild(script)
    return () => { document.getElementById('hasaka-chat-script')?.remove() }
  }, [])

  return (
    <div className="hirepg">
      <div id="hire-chat" />
    </div>
  )
}
