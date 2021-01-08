declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      GITTRENDS_PROXY_PROTOCOL?: string;
      GITTRENDS_PROXY_HOST?: string;
      GITTRENDS_PROXY_PORT?: number;
      GITTRENDS_PROXY_TIMEOUT?: number;
      GITTRENDS_PROXY_RETRIES?: number;
      GITTRENDS_PROXY_USER_AGENT?: string;
      GITTRENDS_REDIS_HOST?: string;
      GITTRENDS_REDIS_PORT?: number;
      GITTRENDS_REDIS_DB?: number;
      GITTRENDS_QUEUE_BOARD_PORT?: number;
      GITTRENDS_CACHE_SIZE?: number;
      PORT?: number;
    }
  }

  type TObject = Record<string, unknown>;
}

// If this file has no import/export statements (i.e. is a script)
export {};
