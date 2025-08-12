import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Один вызов централизованного сида, дальше можно расширять
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/seed-achievements`, { method: 'POST' }).catch(() => null)
    const ok = !!res && res.ok
    return NextResponse.json({ ok })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'seed error' }, { status: 500 })
  }
}


