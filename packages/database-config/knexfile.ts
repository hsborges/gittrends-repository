/*
 *  Author: Hudson S. Borges
 */
import { resolve } from 'path';
import { Config } from 'knex';

const USERNAME = process.env.GITTRENDS_DATABASE_USERNAME;
const PASSWORD = process.env.GITTRENDS_DATABASE_PASSWORD;
const HOST = process.env.GITTRENDS_DATABASE_HOST ?? 'localhost';
const PORT = parseInt(process.env.GITTRENDS_DATABASE_PORT ?? '5432', 10);
const DB = process.env.GITTRENDS_DATABASE_DB;

let connectionString = `postgres://`;
if (process.env.GITTRENDS_DATABASE_USERNAME) connectionString += `${USERNAME}:${PASSWORD}@`;
connectionString += `${HOST}:${PORT}/${DB}?client_encoding=C`;

const options: Config = {
  client: 'pg',
  connection: {
    connectionString: connectionString,
    compress: true,
    timezone: 'utc'
  },
  pool: {
    min: parseInt(process.env.GITTRENDS_DATABASE_POOL_MIN ?? '2', 10),
    max: parseInt(process.env.GITTRENDS_DATABASE_POOL_MAX ?? '10', 10)
  },
  migrations: {
    directory: resolve(__dirname, 'knex_migrations'),
    tableName: 'knex_migrations'
  },
  useNullAsDefault: true
};

export default options;
