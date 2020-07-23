// Update with your config settings.

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.GITTRENDS_WEBSITE_HOST,
      port: process.env.GITTRENDS_WEBSITE_PORT,
      database: process.env.GITTRENDS_WEBSITE_DB,
      user: process.env.GITTRENDS_WEBSITE_USERNAME,
      password: process.env.GITTRENDS_WEBSITE_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
