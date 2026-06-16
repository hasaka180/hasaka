import { NextResponse } from 'next/server'
import { Client, Storage, ID, Permission, Role } from 'node-appwrite'
import { InputFile } from 'node-appwrite/file'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.APPWRITE_ENDPOINT
const PROJECT = process.env.APPWRITE_PROJECT_ID
const API_KEY = process.env.APPWRITE_API_KEY
const BUCKET = process.env.APPWRITE_BUCKET_ID

export async function POST(req: Request) {
  if (!ENDPOINT || !PROJECT || !API_KEY || !BUCKET) {
    return NextResponse.json(
      { error: 'Uploads not configured. Set APPWRITE_BUCKET_ID (and the other APPWRITE_* vars).' },
      { status: 503 },
    )
  }

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const storage = new Storage(
      new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY),
    )

    const created = await storage.createFile({
      bucketId: BUCKET,
      fileId: ID.unique(),
      file: InputFile.fromBuffer(buffer, file.name || 'upload'),
      permissions: [Permission.read(Role.any())], // public read for delivery
    })

    const url = `${ENDPOINT}/storage/buckets/${BUCKET}/files/${created.$id}/view?project=${PROJECT}`
    return NextResponse.json({ url, id: created.$id })
  } catch (e) {
    console.error('Upload failed:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
