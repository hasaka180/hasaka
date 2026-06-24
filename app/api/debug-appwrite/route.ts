import { NextResponse } from 'next/server'
import { Client, TablesDB, Query } from 'node-appwrite'

/**
 * TEMPORARY diagnostic. Reports which Appwrite env vars are present (booleans
 * only — never their values) and the raw error from a live read attempt, so we
 * can pinpoint why the connection fails. Delete this route once fixed.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const env = {
    APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || null, // endpoint is not secret
    has_PROJECT_ID: !!process.env.APPWRITE_PROJECT_ID,
    has_API_KEY: !!process.env.APPWRITE_API_KEY,
    has_DATABASE_ID: !!process.env.APPWRITE_DATABASE_ID,
    has_COLLECTION_ID: !!process.env.APPWRITE_COLLECTION_ID,
  }

  if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY || !process.env.APPWRITE_DATABASE_ID || !process.env.APPWRITE_COLLECTION_ID) {
    return NextResponse.json({ env, read: 'skipped — one or more env vars missing' })
  }

  try {
    const tables = new TablesDB(
      new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT!)
        .setProject(process.env.APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!),
    )
    const res = await tables.listRows({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_COLLECTION_ID!,
      queries: [Query.limit(1)],
    })
    return NextResponse.json({ env, read: 'ok', rowCount: res.total })
  } catch (e) {
    return NextResponse.json({
      env,
      read: 'failed',
      errorName: e instanceof Error ? e.name : typeof e,
      errorMessage: e instanceof Error ? e.message : String(e),
      // Appwrite errors carry a numeric code + type
      code: (e as { code?: number })?.code,
      appwriteType: (e as { type?: string })?.type,
    })
  }
}
