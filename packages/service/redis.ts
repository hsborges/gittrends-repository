import { parseRedisUrl } from 'parse-redis-url-simple';

export const REDIS_URL = process.env.GT_REDIS_URL || 'redis://localhost:6379/0';
export const REDIS_PROPS = parseRedisUrl(REDIS_URL)[0];
