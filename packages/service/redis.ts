import IORedis from 'ioredis';

export const redisOptions = {
  host: process.env.GITTRENDS_REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.GITTRENDS_REDIS_PORT ?? '6379', 10),
  db: parseInt(process.env.GITTRENDS_REDIS_DB ?? '0', 10)
};

export default new IORedis(redisOptions);
