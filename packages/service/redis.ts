import { RedisOptions } from 'ioredis';

export const redisOptions: RedisOptions = {
  host: process.env.GITTRENDS_REDIS_HOST ?? 'localhost',
  port: process.env.GITTRENDS_REDIS_PORT ?? 6379,
  db: process.env.GITTRENDS_REDIS_DB ?? 0
};
