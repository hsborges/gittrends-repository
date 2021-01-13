/*
 *  Author: Hudson S. Borges
 */
import { resolve } from 'path';
import { Config } from 'knex';

const options: Config = {
  client: 'mysql2',
  connection: {
    host: process.env.GITTRENDS_DATABASE_HOST,
    port: parseInt(process.env.GITTRENDS_DATABASE_PORT ?? '3306', 10),
    database: process.env.GITTRENDS_DATABASE_DB,
    user: process.env.GITTRENDS_DATABASE_USERNAME,
    password: process.env.GITTRENDS_DATABASE_PASSWORD,
    compress: true
  },
  pool: {
    min: parseInt(process.env.GITTRENDS_DATABASE_POOL_MIN ?? '2', 10),
    max: parseInt(process.env.GITTRENDS_DATABASE_POOL_MAX ?? '10', 10),
    afterCreate(
      conn: { query: (arg0: string, arg1: (err: Error) => unknown) => void },
      callback: (arg0: Error, arg1: unknown) => unknown
    ): void {
      conn.query('SET time_zone = "+00:00";', (err: Error) => callback(err, conn));
    }
  },
  migrations: {
    directory: resolve(__dirname, 'knex_migrations'),
    tableName: 'knex_migrations'
  },
  useNullAsDefault: true
};

export default options;
