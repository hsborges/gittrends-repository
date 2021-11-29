import IORedis from 'ioredis';

type RedisSources = 'scheduler' | 'cache' | 'default';

export function connectionOptions(source: RedisSources = 'default') {
  let db: number = parseInt(process.env.GT_REDIS_DB ?? '0', 10);

  if (source === 'scheduler') db = parseInt(process.env.GT_REDIS_SCHEDULER_DB ?? '1', 10);
  else if (source === 'cache') db = parseInt(process.env.GT_REDIS_CACHE_DB ?? '2', 10);

  return {
    host: process.env.GT_REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.GT_REDIS_PORT ?? '6379', 10),
    db
  };
}

export function createRedisConnection(source: RedisSources = 'default') {
  return new IORedis(connectionOptions(source));
}
