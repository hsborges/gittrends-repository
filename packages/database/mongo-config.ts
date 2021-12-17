/*
 *  Author: Hudson S. Borges
 */
export const HOST = process.env.GT_DATABASE_HOST ?? 'localhost';
export const PORT = process.env.GT_DATABASE_PORT ?? '27017';
export const DB = process.env.GT_DATABASE_DB ?? 'gittrends_app-development';
export const USERNAME = process.env.GT_DATABASE_USERNAME;
export const PASSWORD = process.env.GT_DATABASE_PASSWORD;
export const POOL_SIZE = process.env.GT_DATABASE_POOL_SIZE ?? '5';

export const CONNECTION_URL = USERNAME
  ? `mongodb://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/?authSource=admin&authMechanism=DEFAULT`
  : `mongodb://${HOST}:${PORT}/`;
