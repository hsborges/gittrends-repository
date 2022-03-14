/*
 *  Author: Hudson S. Borges
 */
import IORedis from 'ioredis';
import { parseRedisUrl } from 'parse-redis-url-simple';

const [{ host, port, database, password }] = parseRedisUrl(
  process.env.GT_REDIS_URL || 'redis://localhost:6379/0'
);

export function useRedis() {
  return new IORedis({
    host,
    port,
    password,
    db: parseInt(database || '0', 10),
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
}
