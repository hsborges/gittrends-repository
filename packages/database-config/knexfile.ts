/*
 *  Author: Hudson S. Borges
 */
import { resolve } from 'path';

export default {
  client: 'mysql2',
  connection: {
    host: process.env.GITTRENDS_DATABASE_HOST,
    port: process.env.GITTRENDS_DATABASE_PORT ?? 5432,
    database: process.env.GITTRENDS_DATABASE_DB,
    user: process.env.GITTRENDS_DATABASE_USERNAME,
    password: process.env.GITTRENDS_DATABASE_PASSWORD
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
