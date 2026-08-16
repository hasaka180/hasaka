import { NextResponse } from 'next/server'

/**
 * /hire message → email.
 *
 * The visitor's address goes in Reply-To, so hitting Reply in Gmail answers
 * the visitor directly. No chat server, no socket, nothing to keep alive.
 */

const RESEND_KEY = process.env.RESEND_API_KEY
const TO_EMAIL = process.env.HIRE_TO_EMAIL || 'hasakasasaranga@gmail.com'
// Resend allows this sender with no domain verification, but only to the
// address the Resend account was created with. Swap it for an address on a
// verified domain (e.g. 'Hasaka <hello@hasaka.io>') once DNS is set up.
// The display name must be a plain RFC 5322 phrase — punctuation like "." or
// "/" has to be quoted, and unquoted it gets rejected as a malformed address.
const FROM_EMAIL = process.env.HIRE_FROM_EMAIL || 'Hasaka Hire <onboarding@resend.dev>'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  )

export async function POST(req: Request) {
  if (!RESEND_KEY) {
    return NextResponse.json({ error: 'Email is not configured yet.' }, { status: 503 })
  }

  const payload = await req.json().catch(() => null)
  if (!payload) return NextResponse.json({ error: 'Bad request.' }, { status: 400 })

  // Honeypot — bots fill every field they find, people never see this one.
  if (clean(payload.company, 200)) return NextResponse.json({ ok: true })

  const name = clean(payload.name, 80)
  const email = clean(payload.email, 160)
  const message = clean(payload.message, 4000)
  const page = clean(payload.page, 300)

  if (!name) return NextResponse.json({ error: 'Please add your name.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'That email address looks off.' }, { status: 400 })
  }
  if (!message) return NextResponse.json({ error: 'Please write a message.' }, { status: 400 })

  const text = `${message}\n\n— ${name} <${email}>\n${page || 'hasaka.io/hire'}`
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#16151A">
      <p style="white-space:pre-wrap;margin:0 0 22px">${esc(message)}</p>
      <p style="margin:0;color:#6b6875;font-size:13px">
        <strong style="color:#16151A">${esc(name)}</strong> &lt;${esc(email)}&gt;<br>
        ${esc(page || 'hasaka.io/hire')}<br>
        <span style="color:#9A97A5">Reply to this email and it goes straight to ${esc(name)}.</span>
      </p>
    </div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: email,
      subject: `New enquiry from ${name} — hasaka.io/hire`,
      text,
      html,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[hire] resend failed:', res.status, detail)
    // `code` carries only the upstream HTTP status — no key, no message body —
    // so a failure can be diagnosed without digging through platform logs.
    // `code` carries only the upstream HTTP status — no key, no message body.
    // Note: Resend answers an invalid API key with 400, not 401, so a 400 here
    // means "check the key" at least as often as it means "check the payload".
    return NextResponse.json(
      { error: 'Could not send that — please try again.', code: `upstream_${res.status}` },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
