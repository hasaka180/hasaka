import { NextResponse } from 'next/server'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function POST(req: Request) {
  if (!TOKEN || !CHAT_ID) {
    return NextResponse.json({ error: 'Telegram not configured' }, { status: 503 })
  }
  const { text } = await req.json().catch(() => ({}))
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
  })
  const data = await res.json()
  return NextResponse.json(data)
}
