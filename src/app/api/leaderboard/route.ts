import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Category = 'xp' | 'speed' | 'achievements' | 'code'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = (searchParams.get('category') as Category) || 'xp'
    const currentName = (searchParams.get('name') || '').trim()

    const cacheKey = `leaderboard:${category}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      const payload = JSON.parse(cached)
      if (currentName && Array.isArray(payload?.players)) {
        payload.players = payload.players.map((p: any) => ({ ...p, isCurrentPlayer: p.name === currentName }))
      }
      return NextResponse.json(payload)
    }

    // Пользователи с прогрессом
    const users = await prisma.user.findMany({
      include: {
        progress: true,
        _count: { select: { completedLevels: true } },
      },
    })

    // Кол-во разблокированных достижений на пользователя (одним запросом)
    const unlockedAgg = await prisma.userAchievement.groupBy({
      by: ['userId'],
      where: { unlocked: true },
      _count: { _all: true },
    })
    const unlockedMap = new Map(unlockedAgg.map((u) => [u.userId, u._count._all]))

    const players = users.map((u) => {
      const totalXP = u.progress?.totalXP ?? 0
      const playTime = u.progress?.playTime ?? 0
      const codeLines = Math.floor(totalXP / 2)
      const achievements = unlockedMap.get(u.id) || 0
      const completedLevels = u._count.completedLevels || 0
      return {
        id: u.id,
        name: u.name,
        totalXP,
        completedLevels,
        playTime,
        achievements,
        codeLines,
        isCurrentPlayer: currentName && u.name === currentName,
      }
    })

    const sorted = players.sort((a, b) => {
      switch (category) {
        case 'xp': return b.totalXP - a.totalXP
        case 'speed': return (a.playTime || Infinity) - (b.playTime || Infinity)
        case 'achievements': return b.achievements - a.achievements
        case 'code': return b.codeLines - a.codeLines
      }
    }).map((p, idx) => ({ ...p, rank: idx + 1 }))

    const payload = { ok: true, players: sorted }
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 60) // кэш 60 сек
    return NextResponse.json(payload)
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'server error' }, { status: 500 })
  }
}


