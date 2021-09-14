import IORedis from 'ioredis';

export const scheduler = new IORedis({
  host: process.env.GITTRENDS_REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.GITTRENDS_REDIS_PORT ?? '6379', 10),
  db: parseInt(process.env.GITTRENDS_REDIS_SCHEDULER_DB ?? '1', 10)
});

export const cache = new IORedis({
  host: process.env.GITTRENDS_REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.GITTRENDS_REDIS_PORT ?? '6379', 10),
  db: parseInt(process.env.GITTRENDS_REDIS_CACHE_DB ?? '2', 10)
});

export default new IORedis({
  host: process.env.GITTRENDS_REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.GITTRENDS_REDIS_PORT ?? '6379', 10),
  db: parseInt(process.env.GITTRENDS_REDIS_DB ?? '0', 10)
});
