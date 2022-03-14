/*
 *  Author: Hudson S. Borges
 */
import { CONNECTION_URL } from './util/mongo-config';

export = {
  mongodb: {
    url: CONNECTION_URL,
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
