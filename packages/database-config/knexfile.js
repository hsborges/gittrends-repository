/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config({ path: '../../.env' });

module.exports = {
  client: 'postgresql',
  connection: {
    host: process.env.GITTRENDS_POSTGRES_HOST,
    port: process.env.GITTRENDS_POSTGRES_PORT,
    database: process.env.GITTRENDS_POSTGRES_DB,
    user: process.env.GITTRENDS_POSTGRES_USERNAME,
    password: process.env.GITTRENDS_POSTGRES_PASSWORD,
    timezone: 'utc'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: 'knex_migrations',
    tableName: 'knex_migrations'
  }
};
