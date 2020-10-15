/*
 *  Author: Hudson S. Borges
 */
require('dotenv').config({ path: '../../.env' });

const { resolve } = require('path');

const rootDir = resolve(__dirname, '..', '..');

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: process.env.GITTRENDS_API_FILENAME
      ? resolve(rootDir, process.env.GITTRENDS_API_FILENAME)
      : resolve(rootDir, 'dumps', `database-${process.env.NODE_ENV || 'development'}.sqlite3`)
  },
  migrations: {
    directory: resolve(__dirname, 'knex_migrations'),
    tableName: 'knex_migrations'
  },
  useNullAsDefault: true
};
