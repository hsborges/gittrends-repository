/*
 *  Author: Hudson S. Borges
 */
export const POOL_SIZE = parseInt(process.env.GT_MONGO_POOL_SIZE ?? '5');
export const CONNECTION_URL =
  process.env.GT_MONGO_URL || `mongodb://localhost:27017/gittrends_app-development`;
