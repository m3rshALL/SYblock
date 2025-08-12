import { Queue, JobsOptions } from 'bullmq'
import { redis as connection } from '@/lib/redis'

export const leaderboardQueue = new Queue('leaderboard', { connection })

export type LeaderboardJobData = { category: 'xp' | 'speed' | 'achievements' | 'code' }

export async function enqueueLeaderboardRebuild(category: LeaderboardJobData['category'], opts?: JobsOptions) {
  await leaderboardQueue.add('rebuild', { category }, { removeOnComplete: 100, removeOnFail: 50, ...opts })
}


