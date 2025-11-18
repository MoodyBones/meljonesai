import {NextResponse} from 'next/server'
import fs from 'fs'
import {promises as fsp} from 'fs'
import path from 'path'

type Draft = {
  id: string
  title: string
  company?: string
  content: string
  tags?: string
  createdAt: string
}

const DATA_DIR = path.join(process.cwd(), 'web', 'data')
const DRAFTS_FILE = path.join(DATA_DIR, 'drafts.json')

function validateBody(body: unknown) {
  if (!body || typeof body !== 'object') return 'Missing body'
  const b = body as Record<string, unknown>
  if (!b.title || String(b.title).trim().length < 3) return 'Title must be at least 3 characters.'
  if (!b.content || String(b.content).trim().length < 10)
    return 'Content must be at least 10 characters.'
  return null
}

async function ensureDataFile() {
  try {
    await fsp.mkdir(DATA_DIR, {recursive: true})
    await fsp.access(DRAFTS_FILE, fs.constants.F_OK)
  } catch {
    // create empty array file
    await fsp.writeFile(DRAFTS_FILE, '[]', 'utf8')
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const v = validateBody(body)
    if (v) {
      return NextResponse.json({error: v}, {status: 400})
    }

    await ensureDataFile()
    const raw = await fsp.readFile(DRAFTS_FILE, 'utf8')
    const list: Draft[] = JSON.parse(raw || '[]')

    const draft: Draft = {
      id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8),
      title: String(body.title).trim(),
      company: body.company ? String(body.company).trim() : undefined,
      content: String(body.content).trim(),
      tags: body.tags ? String(body.tags).trim() : undefined,
      createdAt: new Date().toISOString(),
    }

    list.unshift(draft)
    await fsp.writeFile(DRAFTS_FILE, JSON.stringify(list, null, 2), 'utf8')

    // Optionally forward to n8n webhook if configured
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    let forwarded: Record<string, unknown> | null = null
    if (n8nUrl) {
      try {
        const res = await fetch(n8nUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(draft),
        })
        forwarded = {status: res.status, ok: res.ok}
      } catch (err) {
        // swallow forwarding errors but include info in response
        forwarded = {error: String(err)}
      }
    }

    return NextResponse.json({ok: true, draft, forwarded})
  } catch (err) {
    // Generic server error
    console.error('Error in /api/admin/drafts', err)
    return NextResponse.json({error: 'Server error'}, {status: 500})
  }
}
