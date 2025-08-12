import { Worker } from 'bullmq'
import { prisma } from '../lib/prisma'
import { redis as connection } from '../lib/redis'

type Category = 'xp' | 'speed' | 'achievements' | 'code'

const buildAndCache = async (category: Category) => {
  const users = await prisma.user.findMany({ include: { progress: true, _count: { select: { completedLevels: true } } } })
  const unlockedAgg = await prisma.userAchievement.groupBy({ by: ['userId'], where: { unlocked: true }, _count: { _all: true } })
  const unlockedMap = new Map(unlockedAgg.map((u) => [u.userId, u._count._all]))

  const players = users.map((u) => ({
    id: u.id,
    name: u.name,
    totalXP: u.progress?.totalXP ?? 0,
    completedLevels: u._count.completedLevels || 0,
    playTime: u.progress?.playTime ?? 0,
    achievements: unlockedMap.get(u.id) || 0,
    codeLines: Math.floor((u.progress?.totalXP ?? 0) / 2),
  }))

  const sorted = players.sort((a, b) => {
    switch (category) {
      case 'xp': return b.totalXP - a.totalXP
      case 'speed': return (a.playTime || Infinity) - (b.playTime || Infinity)
      case 'achievements': return b.achievements - a.achievements
      case 'code': return b.codeLines - a.codeLines
    }
  }).map((p, idx) => ({ ...p, rank: idx + 1 }))

  await connection.set(`leaderboard:${category}`, JSON.stringify({ ok: true, players: sorted }), 'EX', 300)
}

export const leaderboardWorker = new Worker('leaderboard', async (job) => {
  const category = (job.data?.category || 'xp') as Category
  await buildAndCache(category)
}, { connection })


