import IORedis from 'ioredis';
import { parseRedisUrl } from 'parse-redis-url-simple';

export const REDIS_URL = process.env.GT_REDIS_URL || 'redis://localhost:6379/0';

const { host, port, database, password } = parseRedisUrl(REDIS_URL)[0];

export const REDIS_PROPS: IORedis.RedisOptions = {
  host,
  port,
  password,
  db: parseInt(database || '0', 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

export const REDIS_CONNECTION = new IORedis(REDIS_PROPS);
