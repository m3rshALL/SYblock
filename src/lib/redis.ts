import Redis from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis: Redis = global.redis || new Redis(redisUrl, {
  // BullMQ требует null для блокирующих команд (BRPOP и т.д.)
  maxRetriesPerRequest: null as any,
  enableReadyCheck: true,
})

if (!global.redis) {
  global.redis = redis
}

export default redis


