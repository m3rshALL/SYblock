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

    console.log('POST /api/progress - данные:', { name, totalXP, currentLevel, completedLevels: completedLevels?.length, unlockedLevels: unlockedLevels?.length })

    if (!name) return NextResponse.json({ ok: false, message: 'name is required' }, { status: 400 })

    const user = await prisma.user.upsert({ where: { name }, update: {}, create: { name } })
    console.log('Пользователь найден/создан:', user.id)

    const progress = await prisma.progress.upsert({
      where: { userId: user.id },
      update: { totalXP: totalXP ?? 0, currentLevel: currentLevel ?? 1, playTime: playTime ?? 0, lastPlayed: new Date() },
      create: { userId: user.id, totalXP: totalXP ?? 0, currentLevel: currentLevel ?? 1, playTime: playTime ?? 0 },
    })

    // Обработка завершенных уровней с валидацией
    if (completedLevels !== undefined) {
      try {
        // Нормализуем данные: если число - преобразуем в массив, если массив - дедуплицируем
        let levelArray: number[] = []
        if (Array.isArray(completedLevels)) {
          levelArray = [...new Set(completedLevels.filter(id => typeof id === 'number' && id >= 1 && id <= 5))]
        } else if (typeof completedLevels === 'number' && completedLevels >= 1 && completedLevels <= 5) {
          // Если пришло число - создаем массив от 1 до этого числа
          levelArray = Array.from({ length: completedLevels }, (_, i) => i + 1)
        }
        
        console.log('Нормализованные завершенные уровни:', levelArray)
        
        if (levelArray.length > 0) {
          // Используем upsert для каждого уровня вместо delete+createMany
          await Promise.all(
            levelArray.map(levelId =>
              prisma.completedLevel.upsert({
                where: { userId_levelId: { userId: user.id, levelId } },
                update: {},
                create: { userId: user.id, levelId }
              })
            )
          )
          console.log('Обновлены завершенные уровни:', levelArray.length)
        }
      } catch (error) {
        console.error('Ошибка обновления завершенных уровней:', error)
        // Не бросаем ошибку, чтобы не прерывать сохранение других данных
      }
    }

    // Обработка разблокированных уровней с валидацией
    if (unlockedLevels !== undefined) {
      try {
        // Нормализуем данные
        let levelArray: number[] = []
        if (Array.isArray(unlockedLevels)) {
          levelArray = [...new Set(unlockedLevels.filter(id => typeof id === 'number' && id >= 1 && id <= 5))]
        } else if (typeof unlockedLevels === 'number' && unlockedLevels >= 1 && unlockedLevels <= 5) {
          // Если пришло число - создаем массив от 1 до этого числа
          levelArray = Array.from({ length: unlockedLevels }, (_, i) => i + 1)
        }
        
        console.log('Нормализованные разблокированные уровни:', levelArray)
        
        if (levelArray.length > 0) {
          // Используем upsert для каждого уровня
          await Promise.all(
            levelArray.map(levelId =>
              prisma.unlockedLevel.upsert({
                where: { userId_levelId: { userId: user.id, levelId } },
                update: {},
                create: { userId: user.id, levelId }
              })
            )
          )
          console.log('Обновлены разблокированные уровни:', levelArray.length)
        }
      } catch (error) {
        console.error('Ошибка обновления разблокированных уровней:', error)
        // Не бросаем ошибку, чтобы не прерывать сохранение других данных
      }
    }

    // Достижения - используем upsert для синхронного обновления
    if (Array.isArray(achievements)) {
      try {
        console.log('Обновление достижений:', achievements.length)
        
        // Используем транзакцию для атомарности операций с достижениями
        await prisma.$transaction(async (tx) => {
          const unlockedCount = achievements.filter((a: any) => a.unlocked).length
          console.log(`🏆 Разблокируем ${unlockedCount} достижений`)
          
          for (const achievement of achievements) {
            await tx.userAchievement.upsert({
              where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } },
              update: { 
                unlocked: !!achievement.unlocked,
                unlockedAt: achievement.unlocked ? new Date() : null
              },
              create: {
                userId: user.id,
                achievementId: achievement.id,
                unlocked: !!achievement.unlocked,
                unlockedAt: achievement.unlocked ? new Date() : null,
              }
            })
          }
        })
        
        console.log('✅ Достижения успешно обновлены:', achievements.filter((a: any) => a.unlocked).length, 'разблокировано')
      } catch (error) {
        console.error('❌ Ошибка обновления достижений:', error)
        // Не бросаем ошибку, чтобы не прерывать сохранение других данных
      }
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
    console.error('Ошибка в POST /api/progress:', e)
    return NextResponse.json({ ok: false, message: e?.message || 'server error' }, { status: 500 })
  }
}


