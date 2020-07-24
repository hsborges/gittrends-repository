/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config();
require('pretty-error').start();

const Bull = require('bull');
const program = require('commander');
const { mongo } = require('@monorepo/database-config');

const worker = require('./updater-worker.js');

const {
  config: { resources },
  version
} = require('./package.json');

/* execute */
program
  .version(version)
  .arguments('<resource>')
  .description('Update resource of a given type')
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .action(async (resource) => {
    if (resources.indexOf(resource.toLowerCase()) < 0)
      throw new Error("Invalid 'resource' argument values!");

    console.log(`Processing ${resource.toLowerCase()} job using ${program.workers} workers`);

    return mongo.connect().then(() => {
      const queue = new Bull(`updates:${resource}`, {
        redis: {
          host: process.env.GITTRENDS_REDIS_HOST || 'localhost',
          port: parseInt(process.env.GITTRENDS_REDIS_PORT || 6379, 10),
          db: parseInt(process.env.GITTRENDS_REDIS_DB || 0, 10)
        },
        settings: {
          stalledInterval: 60000,
          maxStalledCount: 10
        }
      });

      queue.process('*', program.workers, worker);
    });
  })
  .parse(process.argv);
