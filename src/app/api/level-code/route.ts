import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const name = (searchParams.get('name') || '').trim()
    const level = Number(searchParams.get('level') || '')
    if (!name || !Number.isFinite(level) || level < 1) {
      return NextResponse.json({ ok: false, message: 'Invalid params' }, { status: 400 })
    }

    const cacheKey = `levelcode:${name}:${level}`
    const cached = await redis.get(cacheKey)
    if (cached) return NextResponse.json(JSON.parse(cached))

    const user = await prisma.user.findUnique({ where: { name } })
    if (!user) {
      const payload = { ok: true, code: null }
      await redis.set(cacheKey, JSON.stringify(payload), 'EX', 30)
      return NextResponse.json(payload)
    }

    const lc = await prisma.levelCode.findUnique({ where: { userId_levelId: { userId: user.id, levelId: level } } })
    const payload = { ok: true, code: lc?.code ?? null }
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 30)
    return NextResponse.json(payload)
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { name?: string, levelId?: number, code?: string }
    const name = (body.name || '').toString().trim()
    const levelId = Number(body.levelId)
    const code = (body.code ?? '').toString()
    if (!name || !Number.isFinite(levelId) || levelId < 1) {
      return NextResponse.json({ ok: false, message: 'Invalid body' }, { status: 400 })
    }

    const user = await prisma.user.upsert({ where: { name }, update: {}, create: { name } })
    const saved = await prisma.levelCode.upsert({
      where: { userId_levelId: { userId: user.id, levelId } },
      update: { code },
      create: { userId: user.id, levelId, code },
    })

    // Invalidate caches
    try {
      await redis.del(`levelcode:${name}:${levelId}`)
      await redis.del(`progress:${name}`)
    } catch {}

    return NextResponse.json({ ok: true, code: saved.code })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'server error' }, { status: 500 })
  }
}


