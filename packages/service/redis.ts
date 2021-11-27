import IORedis from 'ioredis';

export function createRedisConnection(source: 'scheduler' | 'cache' | 'default' = 'default') {
  let db: number = parseInt(process.env.GT_REDIS_DB ?? '0', 10);

  if (source === 'scheduler') db = parseInt(process.env.GT_REDIS_SCHEDULER_DB ?? '1', 10);
  else if (source === 'cache') db = parseInt(process.env.GT_REDIS_CACHE_DB ?? '2', 10);

  return new IORedis({
    host: process.env.GT_REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.GT_REDIS_PORT ?? '6379', 10),
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    db
  });
}
