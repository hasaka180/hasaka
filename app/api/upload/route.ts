import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY
const BUCKET = process.env.R2_BUCKET
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE_URL // e.g. https://pub-xxxx.r2.dev

const FOLDERS = new Set(['work', 'cases', 'journal', 'misc'])

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 12)

export async function POST(req: Request) {
  if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY || !BUCKET || !PUBLIC_BASE) {
    return NextResponse.json(
      { error: 'Uploads not configured. Set the R2_* environment variables.' },
      { status: 503 },
    )
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
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
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
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
