import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Accept a few common env var names so it works with the values copied from
// Cloudflare's R2 "S3 API" token screen.
const ENDPOINT =
  process.env.R2_S3_API_ENDPOINT ||
  process.env.R2_ENDPOINT ||
  (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined)
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID || process.env.ACCESS_KEY_ID
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY || process.env.SECRET_ACCESS_KEY
const BUCKET = process.env.R2_BUCKET
// Public bucket URL. Falls back to the known r2.dev address if the env var is unset.
const PUBLIC_BASE =
  process.env.R2_PUBLIC_BASE_URL || 'https://pub-4a897165e53a4f299d9edcba9b810de7.r2.dev'

const FOLDERS = new Set(['work', 'cases', 'journal', 'misc'])

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 12)

export async function POST(req: Request) {
  if (!ENDPOINT || !ACCESS_KEY || !SECRET_KEY || !BUCKET || !PUBLIC_BASE) {
    const missing = [
      !ENDPOINT && 'R2_S3_API_ENDPOINT (or R2_ACCOUNT_ID)',
      !ACCESS_KEY && 'R2_ACCESS_KEY_ID / ACCESS_KEY_ID',
      !SECRET_KEY && 'R2_SECRET_ACCESS_KEY',
      !BUCKET && 'R2_BUCKET',
      !PUBLIC_BASE && 'R2_PUBLIC_BASE_URL',
    ].filter(Boolean).join(', ')
    return NextResponse.json({ error: `Uploads not configured. Missing: ${missing}` }, { status: 503 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // route into the work / cases / journal folder
    const requested = String(form.get('folder') || 'misc')
    const folder = FOLDERS.has(requested) ? requested : 'misc'

    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
    const key = `${folder}/${uid()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const s3 = new S3Client({
      region: 'auto',
      endpoint: ENDPOINT,
      credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    })

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    }))

    const url = `${PUBLIC_BASE.replace(/\/$/, '')}/${key}`
    return NextResponse.json({ url, key })
  } catch (e) {
    console.error('R2 upload failed:', e)
    // surfaced for debugging — this route is password-gated
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 500 })
  }
}
