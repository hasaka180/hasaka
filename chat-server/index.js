'use strict'
const express = require('express')
const { createServer } = require('http')
const { WebSocketServer, WebSocket } = require('ws')
const jwt = require('jsonwebtoken')
const db = require('./db')

const PORT            = process.env.PORT            || 3001
const JWT_SECRET      = process.env.JWT_SECRET      || 'change-me-in-production'
const AGENT_EMAIL     = process.env.AGENT_EMAIL     || 'hasaka@hasaka.io'
const AGENT_PASSWORD  = process.env.AGENT_PASSWORD  || 'change-me'
const AGENT_NAME      = process.env.AGENT_NAME      || 'Hasaka'
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://hasaka.io,http://localhost:3000').split(',').map(s => s.trim())
const TG_TOKEN        = process.env.TELEGRAM_BOT_TOKEN
const TG_CHAT         = process.env.TELEGRAM_CHAT_ID

const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
const now = () => Date.now()

async function notifyTelegram(text) {
  if (!TG_TOKEN || !TG_CHAT) return
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'Markdown' }),
    })
  } catch {}
}

// ── Shape helpers ─────────────────────────────────────────────────────────────
function rowToConv(r) {
  return {
    id: r.id, visitorId: r.visitor_id, visitorName: r.visitor_name ?? null,
    visitorEmail: r.visitor_email ?? null, pageUrl: r.page_url ?? null,
    userAgent: r.user_agent ?? null, locale: r.locale ?? null,
    status: r.status, unreadCount: r.unread_count,
    lastMessage: r.last_message ?? null, lastMessageAt: r.last_message_at ?? null,
    createdAt: r.created_at,
  }
}
function rowToMsg(r) {
  return {
    id: r.id, conversationId: r.conversation_id, author: r.author,
    authorName: r.author_name ?? null, body: r.body, createdAt: r.created_at,
  }
}

// ── Express ───────────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

function requireAgent(req, res, next) {
  const auth = req.headers.authorization ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.agent = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

const AGENT = { id: 'agt_hasaka', name: AGENT_NAME, email: AGENT_EMAIL }

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (email !== AGENT_EMAIL || password !== AGENT_PASSWORD) {
    return res.status(401).json({ error: 'That email and password do not match.' })
  }
  const token = jwt.sign({ id: AGENT.id, email: AGENT.email }, JWT_SECRET, { expiresIn: '90d' })
  res.json({ token, agent: AGENT })
})

app.get('/api/me', requireAgent, (req, res) => {
  const { n } = db.prepare(`SELECT COALESCE(SUM(unread_count),0) AS n FROM conversations WHERE status='open'`).get()
  res.json({ agent: AGENT, unreadCount: n })
})

app.get('/api/conversations', requireAgent, (req, res) => {
  const { status = 'open', limit = 50, offset = 0 } = req.query
  const rows = db.prepare(
    `SELECT * FROM conversations WHERE status=? ORDER BY last_message_at DESC LIMIT ? OFFSET ?`
  ).all(status, +limit, +offset)
  res.json({ conversations: rows.map(rowToConv) })
})

app.get('/api/conversations/:id/messages', requireAgent, (req, res) => {
  const conv = db.prepare(`SELECT * FROM conversations WHERE id=?`).get(req.params.id)
  if (!conv) return res.status(404).json({ error: 'Not found' })
  const { limit = 200 } = req.query
  const messages = db.prepare(
    `SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at ASC LIMIT ?`
  ).all(req.params.id, +limit)
  res.json({ conversation: rowToConv(conv), messages: messages.map(rowToMsg) })
})

app.post('/api/conversations/:id/messages', requireAgent, (req, res) => {
  const conv = db.prepare(`SELECT * FROM conversations WHERE id=?`).get(req.params.id)
  if (!conv) return res.status(404).json({ error: 'Not found' })
  const { body } = req.body ?? {}
  if (!body) return res.status(400).json({ error: 'body required' })
  const m = { id: uid('msg'), conversation_id: req.params.id, author: 'agent', author_name: AGENT_NAME, body, created_at: now() }
  db.prepare(`INSERT INTO messages VALUES (@id,@conversation_id,@author,@author_name,@body,@created_at)`).run(m)
  db.prepare(`UPDATE conversations SET last_message=?,last_message_at=? WHERE id=?`).run(body, m.created_at, req.params.id)
  const updatedConv = db.prepare(`SELECT * FROM conversations WHERE id=?`).get(req.params.id)
  broadcastToAgents({ type: 'message', message: rowToMsg(m), conversation: rowToConv(updatedConv) })
  broadcastToVisitor(conv.visitor_id, { type: 'message', message: rowToMsg(m) })
  res.json({ message: rowToMsg(m) })
})

app.post('/api/conversations/:id/read', requireAgent, (req, res) => {
  db.prepare(`UPDATE conversations SET unread_count=0 WHERE id=?`).run(req.params.id)
  broadcastToAgents({ type: 'conversation.read', conversationId: req.params.id })
  res.json({ ok: true })
})

app.post('/api/conversations/:id/status', requireAgent, (req, res) => {
  const { status } = req.body ?? {}
  if (!['open', 'resolved'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  db.prepare(`UPDATE conversations SET status=? WHERE id=?`).run(status, req.params.id)
  const conv = db.prepare(`SELECT * FROM conversations WHERE id=?`).get(req.params.id)
  broadcastToAgents({ type: 'conversation.updated', conversation: rowToConv(conv) })
  res.json({ conversation: rowToConv(conv) })
})

app.post('/api/devices', requireAgent, (req, res) => {
  const { token } = req.body ?? {}
  if (!token) return res.status(400).json({ error: 'token required' })
  db.prepare(`INSERT OR REPLACE INTO devices VALUES (?,?)`).run(token, now())
  res.json({ ok: true })
})

app.delete('/api/devices/:token', requireAgent, (req, res) => {
  db.prepare(`DELETE FROM devices WHERE token=?`).run(req.params.token)
  res.json({ ok: true })
})

app.get('/health', (_, res) => res.json({ ok: true, at: now() }))

// ── WebSocket ─────────────────────────────────────────────────────────────────
const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

const agentSockets  = new Set()
const visitorSockets = new Map()  // visitorId → Set<WebSocket>

function broadcastToAgents(data) {
  const str = JSON.stringify(data)
  agentSockets.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(str) })
}
function broadcastToVisitor(visitorId, data) {
  const sockets = visitorSockets.get(visitorId)
  if (!sockets) return
  const str = JSON.stringify(data)
  sockets.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(str) })
}

wss.on('connection', (ws, req) => {
  const url    = new URL(req.url, 'http://localhost')
  const role   = url.searchParams.get('role')
  ws.isAlive   = true
  ws.on('pong', () => { ws.isAlive = true })

  // ── Agent ──
  if (role === 'agent') {
    try { jwt.verify(url.searchParams.get('token'), JWT_SECRET) }
    catch { ws.close(4001, 'Unauthorized'); return }

    agentSockets.add(ws)
    ws.send(JSON.stringify({ type: 'ready', agent: AGENT }))

    ws.on('message', raw => {
      let msg; try { msg = JSON.parse(raw) } catch { return }

      if (msg.type === 'message') {
        const conv = db.prepare(`SELECT * FROM conversations WHERE id=?`).get(msg.conversationId)
        if (!conv) return
        const m = { id: uid('msg'), conversation_id: msg.conversationId, author: 'agent', author_name: AGENT_NAME, body: msg.body, created_at: now() }
        db.prepare(`INSERT INTO messages VALUES (@id,@conversation_id,@author,@author_name,@body,@created_at)`).run(m)
        db.prepare(`UPDATE conversations SET last_message=?,last_message_at=? WHERE id=?`).run(msg.body, m.created_at, msg.conversationId)
        const updated = rowToConv(db.prepare(`SELECT * FROM conversations WHERE id=?`).get(msg.conversationId))
        broadcastToAgents({ type: 'message', message: rowToMsg(m), conversation: updated })
        broadcastToVisitor(conv.visitor_id, { type: 'message', message: rowToMsg(m) })

      } else if (msg.type === 'typing') {
        const conv = msg.conversationId
          ? db.prepare(`SELECT visitor_id FROM conversations WHERE id=?`).get(msg.conversationId)
          : null
        if (conv) broadcastToVisitor(conv.visitor_id, { type: 'typing', from: 'agent' })

      } else if (msg.type === 'read') {
        db.prepare(`UPDATE conversations SET unread_count=0 WHERE id=?`).run(msg.conversationId)
        broadcastToAgents({ type: 'conversation.read', conversationId: msg.conversationId })
      }
    })

    ws.on('close', () => agentSockets.delete(ws))

  // ── Visitor ──
  } else {
    const visitorId = url.searchParams.get('visitorId') || uid('vis')
    const pageUrl   = url.searchParams.get('page')
    const locale    = url.searchParams.get('locale')
    const ua        = req.headers['user-agent'] ?? null

    let conv = db.prepare(`SELECT * FROM conversations WHERE visitor_id=? AND status='open'`).get(visitorId)
    if (!conv) {
      conv = {
        id: uid('cnv'), visitor_id: visitorId, visitor_name: null, visitor_email: null,
        page_url: pageUrl, user_agent: ua, locale, status: 'open',
        unread_count: 0, last_message: null, last_message_at: null, created_at: now(),
      }
      db.prepare(`INSERT INTO conversations VALUES
        (@id,@visitor_id,@visitor_name,@visitor_email,@page_url,@user_agent,@locale,
         @status,@unread_count,@last_message,@last_message_at,@created_at)`).run(conv)
    }

    const history = db.prepare(
      `SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at ASC LIMIT 200`
    ).all(conv.id)
    ws.send(JSON.stringify({ type: 'session', visitorId, conversationId: conv.id, messages: history.map(rowToMsg) }))

    if (!visitorSockets.has(visitorId)) visitorSockets.set(visitorId, new Set())
    visitorSockets.get(visitorId).add(ws)

    ws.on('message', raw => {
      let msg; try { msg = JSON.parse(raw) } catch { return }

      if (msg.type === 'message') {
        const m = {
          id: uid('msg'), conversation_id: conv.id, author: 'visitor',
          author_name: conv.visitor_name, body: msg.body, created_at: now(),
        }
        db.prepare(`INSERT INTO messages VALUES (@id,@conversation_id,@author,@author_name,@body,@created_at)`).run(m)
        db.prepare(`UPDATE conversations SET last_message=?,last_message_at=?,unread_count=unread_count+1 WHERE id=?`).run(msg.body, m.created_at, conv.id)
        const updated = rowToConv(db.prepare(`SELECT * FROM conversations WHERE id=?`).get(conv.id))
        broadcastToAgents({ type: 'message', message: rowToMsg(m), conversation: updated })
        notifyTelegram(`💬 *hasaka.io/hire*\n${msg.body}`)

      } else if (msg.type === 'typing') {
        broadcastToAgents({ type: 'typing', conversationId: conv.id, from: 'visitor' })

      } else if (msg.type === 'identify') {
        db.prepare(`UPDATE conversations SET visitor_name=?,visitor_email=? WHERE id=?`).run(msg.name ?? null, msg.email ?? null, conv.id)
        conv = db.prepare(`SELECT * FROM conversations WHERE id=?`).get(conv.id)
        broadcastToAgents({ type: 'conversation.updated', conversation: rowToConv(conv) })
      }
    })

    ws.on('close', () => {
      const sockets = visitorSockets.get(visitorId)
      if (sockets) { sockets.delete(ws); if (!sockets.size) visitorSockets.delete(visitorId) }
    })
  }
})

// Keepalive ping every 25 s
const ping = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate()
    ws.isAlive = false
    ws.ping()
  })
}, 25000)
wss.on('close', () => clearInterval(ping))

server.listen(PORT, () => console.log(`[chat] listening on :${PORT}`))
