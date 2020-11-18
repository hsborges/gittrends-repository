/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config({ path: '../../.env' });

const { resolve } = require('path');

module.exports = {
  client: 'postgresql',
  connection: {
    host: process.env.GITTRENDS_DATABASE_HOST,
    port: process.env.GITTRENDS_DATABASE_PORT,
    database: process.env.GITTRENDS_DATABASE_DB,
    user: process.env.GITTRENDS_DATABASE_USERNAME,
    password: process.env.GITTRENDS_DATABASE_PASSWORD,
    timezone: 'utc'
  },
  pool: {
    min: parseInt(process.env.GITTRENDS_DATABASE_POOL_MIN || 2, 10),
    max: parseInt(process.env.GITTRENDS_DATABASE_POOL_MAX || 10, 10)
  },
  migrations: {
    directory: resolve(__dirname, 'knex_migrations'),
    tableName: 'knex_migrations'
  },
  useNullAsDefault: true
};
