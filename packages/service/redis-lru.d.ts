declare module 'redis-lru' {
  import IORedis from 'ioredis';

  export class LRU {
    async set(key: string, value?: any, maxAge?: number): Promise<void>;
    async get(key: string): Promise<any>;
    async has(key: string): Promise<boolean>;
  }

  export type LRUOptions = {
    max: number;
    namespace?: string;
    maxAge?: number;
    score?: () => number;
    increment?: boolean;
  };

  export default function (redis: IORedis, max: number): LRU;
  export default function (redis: IORedis, opts: LRUOptions): LRU;
}
