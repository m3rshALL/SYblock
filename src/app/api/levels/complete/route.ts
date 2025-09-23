import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_LEVEL = 5

export async function POST(req: NextRequest) {
  try {
    let body: { name?: string, levelId?: number, xp?: number } = {}
    
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('Ошибка парсинга JSON в /api/levels/complete:', parseError)
      return NextResponse.json({ ok: false, message: 'Некорректный JSON в запросе' }, { status: 400 })
    }
    const name = (body.name || '').toString().trim()
    const levelId = Number(body.levelId)
    const xp = Math.max(0, Number(body.xp || 0))
    if (!name || !Number.isFinite(levelId) || levelId < 1 || levelId > MAX_LEVEL) {
      return NextResponse.json({ ok: false, message: 'Invalid params' }, { status: 400 })
    }

    // Готовим пользователя и прогресс
    const user = await prisma.user.upsert({ where: { name }, update: {}, create: { name } })

    // Обновляем список завершенных уровней (идемпотентно)
    await prisma.completedLevel.upsert({
      where: { userId_levelId: { userId: user.id, levelId } },
      update: {},
      create: { userId: user.id, levelId },
    })

    // Разблокируем следующий уровень
    const nextLevel = levelId + 1
    if (nextLevel <= MAX_LEVEL) {
      await prisma.unlockedLevel.upsert({
        where: { userId_levelId: { userId: user.id, levelId: nextLevel } },
        update: {},
        create: { userId: user.id, levelId: nextLevel },
      })
    }

    // Пересчет прогресса
    const completed = await prisma.completedLevel.findMany({ where: { userId: user.id } })
    const totalCompleted = completed.length

    // Обновляем XP / текущий уровень игрока / playTime не трогаем здесь
    const progress = await prisma.progress.upsert({
      where: { userId: user.id },
      update: {
        totalXP: { increment: xp },
        currentLevel: nextLevel <= MAX_LEVEL ? nextLevel : MAX_LEVEL,
        lastPlayed: new Date(),
      },
      create: {
        userId: user.id,
        totalXP: xp,
        currentLevel: nextLevel <= MAX_LEVEL ? nextLevel : MAX_LEVEL,
        playTime: 0,
      },
    })

    // Проверка достижений по правилам
    const def = await prisma.achievementDefinition.findMany()
    const existing = await prisma.userAchievement.findMany({ where: { userId: user.id } })
    const existingIds = new Set(existing.filter(a => a.unlocked).map(a => a.achievementId))

    const toUnlock: { id: string, xpReward: number }[] = []
    const want = new Set(def.map(d => d.id))

    const unlockIf = (id: string, cond: boolean) => {
      if (cond && !existingIds.has(id) && want.has(id)) {
        const d = def.find(x => x.id === id)
        if (d) toUnlock.push({ id, xpReward: d.xpReward })
      }
    }

    unlockIf('first_steps', totalCompleted >= 1)
    unlockIf('beginner_coder', levelId === 1)
    unlockIf('democracy_defender', levelId === 2)
    unlockIf('nft_crafter', levelId === 3)
    unlockIf('dao_master', levelId === 4)
    unlockIf('blockchain_guardian', totalCompleted >= MAX_LEVEL)
    // security_guardian/speed_runner/perfectionist/code_master — по месту при необходимости

    // Применяем анлоки + добавляем XP за достижения
    if (toUnlock.length > 0) {
      try {
        // Используем транзакцию для атомарности операций с достижениями
        await prisma.$transaction(async (tx) => {
          console.log(`🏆 Разблокируем ${toUnlock.length} достижений`)
          
          // Разблокируем достижения
          for (const achievement of toUnlock) {
            await tx.userAchievement.upsert({
              where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } },
              update: { 
                unlocked: true,
                unlockedAt: new Date()
              },
              create: {
                userId: user.id,
                achievementId: achievement.id,
                unlocked: true,
                unlockedAt: new Date()
              }
            })
          }
          
          // Обновляем XP
          const totalXpReward = toUnlock.reduce((s, t) => s + t.xpReward, 0)
          await tx.progress.update({ 
            where: { userId: user.id }, 
            data: { totalXP: progress.totalXP + totalXpReward } 
          })
        })
        
        console.log(`✅ Разблокировано достижений: ${toUnlock.length}`)
      } catch (error) {
        console.error('❌ Ошибка разблокировки достижений:', error)
        // Не прерываем выполнение, но логируем ошибку
      }
    }

    // Возвращаем актуальные данные для клиента
    const [newProgress, achievements, unlockedLevels, levelCodes] = await Promise.all([
      prisma.progress.findUnique({ where: { userId: user.id } }),
      prisma.userAchievement.findMany({ where: { userId: user.id }, include: { achievement: true } }),
      prisma.unlockedLevel.findMany({ where: { userId: user.id } }),
      prisma.levelCode.findMany({ where: { userId: user.id } }),
    ])

    const payload = {
      ok: true,
      progress: newProgress,
      completedLevels: completed,
      unlockedLevels,
      achievements: achievements.map(a => ({ id: a.achievementId, title: a.achievement.title, description: a.achievement.description, icon: a.achievement.icon, xpReward: a.achievement.xpReward, unlocked: !!a.unlocked })),
      unlockedAchievements: toUnlock.map(t => ({ id: t.id, title: def.find(d => d.id === t.id)?.title || t.id, description: def.find(d => d.id === t.id)?.description || '', icon: def.find(d => d.id === t.id)?.icon || '🏆', xpReward: t.xpReward, unlocked: true })),
      levelCodes,
    }

    return NextResponse.json(payload)
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'server error' }, { status: 500 })
  }
}


