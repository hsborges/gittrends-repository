/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const Bull = require('bull');
const consola = require('consola');
const program = require('commander');
const { mongo } = require('@gittrends/database-config');

const worker = require('./updater-worker.js');

const {
  config: { resources },
  version
} = require('./package.json');

/* execute */
program
  .version(version)
  .arguments('<resource>')
  .description(`Update repositories metadata (${resources.join(', ')})`)
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .action(async (resource) => {
    if (resources.indexOf(resource.toLowerCase()) < 0)
      throw new Error("Invalid 'resource' argument values!");

    consola.info(`Processing ${resource.toLowerCase()} job using ${program.workers} workers`);

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

      let timeout = null;
      process.on('SIGTERM', async () => {
        consola.warn('Signal received: closing processing queue');
        if (!timeout) {
          await queue.close().then(() => process.exit(0));
          timeout = setTimeout(() => process.exit(1), 30 * 1000);
        }
      });
    });
  })
  .parse(process.argv);
