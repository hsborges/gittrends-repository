import IORedis from 'ioredis';

const baseConfig = {
  host: process.env.GT_REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.GT_REDIS_PORT ?? '6379', 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: true
};

export const scheduler = new IORedis({
  ...baseConfig,
  db: parseInt(process.env.GT_REDIS_SCHEDULER_DB ?? '1', 10)
});

export const cache = new IORedis({
  ...baseConfig,
  db: parseInt(process.env.GT_REDIS_CACHE_DB ?? '2', 10)
});

export default new IORedis({
  ...baseConfig,
  db: parseInt(process.env.GT_REDIS_DB ?? '0', 10)
});
