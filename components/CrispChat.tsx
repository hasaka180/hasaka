'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    $crisp?: unknown[]
    CRISP_WEBSITE_ID?: string
  }
}

/** Loads the Crisp live-chat widget. Reply to visitors from the Crisp iOS app.
 *  No-op until NEXT_PUBLIC_CRISP_WEBSITE_ID is set, so local/dev stays clean. */
export default function CrispChat() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
    if (!id || document.getElementById('crisp-loader')) return

    window.$crisp = window.$crisp || []
    window.CRISP_WEBSITE_ID = id

    // Headless mode: hide Crisp's own launcher/bubble — the custom chat UI
    // drives the conversation via the SDK. Re-hide whenever Crisp tries to show.
    window.$crisp.push(['safe', true])
    window.$crisp.push(['do', 'chat:hide'])
    window.$crisp.push(['on', 'message:received', () => window.$crisp!.push(['do', 'chat:hide'])])
    window.$crisp.push(['on', 'chat:opened', () => window.$crisp!.push(['do', 'chat:hide'])])

    const s = document.createElement('script')
    s.id = 'crisp-loader'
    s.src = 'https://client.crisp.chat/l.js'
    s.async = true
    document.head.appendChild(s)
  }, [])

  return null
}
