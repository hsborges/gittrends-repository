declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      GITTRENDS_DATABASE_HOST?: string;
      GITTRENDS_DATABASE_PORT?: string;
      GITTRENDS_DATABASE_DB?: string;
      GITTRENDS_DATABASE_USERNAME?: string;
      GITTRENDS_DATABASE_PASSWORD?: string;
      GITTRENDS_DATABASE_POOL_SIZE?: string;
      GITTRENDS_PROXY_PROTOCOL?: string;
      GITTRENDS_PROXY_HOST?: string;
      GITTRENDS_PROXY_PORT?: string;
      GITTRENDS_PROXY_TIMEOUT?: string;
      GITTRENDS_PROXY_RETRIES?: string;
      GITTRENDS_PROXY_USER_AGENT?: string;
      GITTRENDS_REDIS_HOST?: string;
      GITTRENDS_REDIS_PORT?: string;
      GITTRENDS_REDIS_DB?: string;
      GITTRENDS_CACHE_SIZE?: string;
      GITTRENDS_WRITE_BATCH_SIZE?: string;
      GITTRENDS_QUEUE_ATTEMPS?: string;
      GITTRENDS_QUEUE_BOARD_PORT?: string;
      PORT?: string;
    }
  }

  type TObject = Record<string, unknown>;
}

// If this file has no import/export statements (i.e. is a script)
export {};
