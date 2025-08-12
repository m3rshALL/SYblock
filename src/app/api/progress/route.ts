import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Получить прогресс пользователя по имени
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const name = (searchParams.get('name') || '').trim()
    if (!name) return NextResponse.json({ ok: false, message: 'name is required' }, { status: 400 })

    const cacheKey = `progress:${name}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    const user = await prisma.user.findUnique({ where: { name } })
    if (!user) return NextResponse.json({ ok: false, message: 'user not found' }, { status: 404 })

    const [progress, userAchievements, completedLevels, unlockedLevels, levelCodes, defs] = await Promise.all([
      prisma.progress.findUnique({ where: { userId: user.id } }),
      prisma.userAchievement.findMany({ where: { userId: user.id }, include: { achievement: true } }),
      prisma.completedLevel.findMany({ where: { userId: user.id } }),
      prisma.unlockedLevel.findMany({ where: { userId: user.id } }),
      prisma.levelCode.findMany({ where: { userId: user.id } }),
      prisma.achievementDefinition.findMany(),
    ])

    // Слить определения достижений с пользовательскими статусами
    const unlockedMap = new Map<string, boolean>(
      userAchievements.map((ua) => [ua.achievementId, !!ua.unlocked])
    )
    const achievements = defs.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      icon: d.icon,
      xpReward: d.xpReward,
      unlocked: unlockedMap.get(d.id) || false,
    }))

    const payload = {
      ok: true,
      user,
      progress,
      achievements,
      completedLevels,
      unlockedLevels,
      levelCodes,
    }
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 30) // кэш 30 сек
    return NextResponse.json(payload)
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'server error' }, { status: 500 })
  }
}

// Обновить прогресс
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, totalXP, currentLevel, playTime, completedLevels, unlockedLevels, achievements, levelCodes } = body || {}

    if (!name) return NextResponse.json({ ok: false, message: 'name is required' }, { status: 400 })

    const user = await prisma.user.upsert({ where: { name }, update: {}, create: { name } })

    const progress = await prisma.progress.upsert({
      where: { userId: user.id },
      update: { totalXP: totalXP ?? 0, currentLevel: currentLevel ?? 1, playTime: playTime ?? 0, lastPlayed: new Date() },
      create: { userId: user.id, totalXP: totalXP ?? 0, currentLevel: currentLevel ?? 1, playTime: playTime ?? 0 },
    })

    // Списки уровней
    if (Array.isArray(completedLevels)) {
      await prisma.$transaction([
        prisma.completedLevel.deleteMany({ where: { userId: user.id } }),
        prisma.completedLevel.createMany({ data: completedLevels.map((levelId: number) => ({ userId: user.id, levelId })) })
      ])
    }
    if (Array.isArray(unlockedLevels)) {
      await prisma.$transaction([
        prisma.unlockedLevel.deleteMany({ where: { userId: user.id } }),
        prisma.unlockedLevel.createMany({ data: unlockedLevels.map((levelId: number) => ({ userId: user.id, levelId })) })
      ])
    }

    // Достижения
    if (Array.isArray(achievements)) {
      await prisma.$transaction([
        prisma.userAchievement.deleteMany({ where: { userId: user.id } }),
        prisma.userAchievement.createMany({
          data: achievements.map((a: any) => ({
            userId: user.id,
            achievementId: a.id,
            unlocked: !!a.unlocked,
            unlockedAt: a.unlocked ? new Date() : null,
          }))
        })
      ])
    }

    // Код уровней
    if (Array.isArray(levelCodes)) {
      await prisma.$transaction([
        prisma.levelCode.deleteMany({ where: { userId: user.id } }),
        prisma.levelCode.createMany({ data: levelCodes.map((lc: any) => ({ userId: user.id, levelId: lc.levelId, code: lc.code || '' })) })
      ])
    }

    // Инвалидация кэша прогресса и лидербордов
    try {
      await redis.del(`progress:${name}`)
      await Promise.all([
        redis.del(`leaderboard:xp:${name}`),
        redis.del(`leaderboard:speed:${name}`),
        redis.del(`leaderboard:achievements:${name}`),
        redis.del(`leaderboard:code:${name}`),
        redis.del(`leaderboard:xp`),
        redis.del(`leaderboard:speed`),
        redis.del(`leaderboard:achievements`),
        redis.del(`leaderboard:code`),
      ])
    } catch {}

    return NextResponse.json({ ok: true, progress })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'server error' }, { status: 500 })
  }
}


