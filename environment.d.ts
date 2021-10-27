/*
 *  Author: Hudson S. Borges
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      GT_DATABASE_HOST?: string;
      GT_DATABASE_PORT?: string;
      GT_DATABASE_DB?: string;
      GT_DATABASE_USERNAME?: string;
      GT_DATABASE_PASSWORD?: string;
      GT_DATABASE_POOL_SIZE?: string;
      GT_PROXY_PROTOCOL?: string;
      GT_PROXY_HOST?: string;
      GT_PROXY_PORT?: string;
      GT_PROXY_TIMEOUT?: string;
      GT_PROXY_USER_AGENT?: string;
      GT_PROXY_RETRIES?: string;
      GT_REDIS_HOST?: string;
      GT_REDIS_PORT?: string;
      GT_REDIS_DB?: string;
      GT_REDIS_SCHEDULER_DB?: string;
      GT_REDIS_CACHE_DB?: string;
      GT_WEBSITE_API_FILE?: string;
      GT_CACHE_SIZE?: string;
      GT_QUEUE_BOARD_PORT?: string;
      PORT?: string;
    }
  }

  type TObject = Record<string, unknown>;
}

// If this file has no import/export statements (i.e. is a script)
export {};
