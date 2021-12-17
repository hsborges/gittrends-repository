/*
 *  Author: Hudson S. Borges
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      GT_MONGO_URL?: string;
      GT_MONGO_POOL_SIZE?: string;
      GT_REDIS_URL?: string;
      GT_PROXY_URL?: string;
      GT_PROXY_TIMEOUT?: string;
      GT_PROXY_USER_AGENT?: string;
      GT_PROXY_RETRIES?: string;
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
