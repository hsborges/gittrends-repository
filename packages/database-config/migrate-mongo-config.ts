/*
 *  Author: Hudson S. Borges
 */
const HOST = process.env.GITTRENDS_DATABASE_HOST ?? 'localhost';
const PORT = process.env.GITTRENDS_DATABASE_PORT ?? '27017';
const DB = process.env.GITTRENDS_DATABASE_DB ?? 'gittrends_app-development';
const USERNAME = process.env.GITTRENDS_DATABASE_USERNAME;
const PASSWORD = process.env.GITTRENDS_DATABASE_PASSWORD;

export = {
  mongodb: {
    url: USERNAME
      ? `mongodb://${USERNAME}:${PASSWORD}@${HOST}:${PORT}?authMechanism=DEFAULT`
      : `mongodb://${HOST}:${PORT}`,
    databaseName: DB,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: '_migrations',

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.ts'
};
