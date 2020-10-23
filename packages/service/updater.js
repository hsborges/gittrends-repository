/*
 *  Author: Hudson S. Borges
 */
global.Promise = require('bluebird');

require('dotenv').config({ path: '../../.env' });
require('pretty-error').start();

const Bull = require('bull');
const consola = require('consola');
const program = require('commander');
const Bottleneck = require('bottleneck');
const { mongo } = require('@gittrends/database-config');

const worker = require('./updater-worker.js');

const {
  config: { resources },
  version
} = require('./package.json');

/* execute */
program
  .version(version)
  .arguments('<resource> [otherResourcers...]')
  .description(`Update repositories metadata (${resources.join(', ')})`)
  .option('-w, --workers [number]', 'Number of workers', Number, 1)
  .action(async (resource, otherResourcers) => {
    const selectedResources = [resource, ...otherResourcers];

    if (
      selectedResources.reduce((valid, r) => valid && resources.indexOf(r.toLowerCase()) < 0, true)
    )
      throw new Error("Invalid 'resource' argument values!");

    const limiter = new Bottleneck({ maxConcurrent: program.workers, minTime: 0 });

    consola.info(
      `Processing ${selectedResources.join(', ')} job(s) using ${program.workers} workers`
    );

    return mongo.connect().then(() => {
      const queues = selectedResources.map((r) => {
        const queue = new Bull(`updates:${r}`, {
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

        queue.process('*', program.workers, (job) => limiter.schedule(() => worker(job)));

        return queue;
      });

      let timeout = null;
      process.on('SIGTERM', async () => {
        consola.warn('Signal received: closing queues');
        if (!timeout) {
          await Promise.all(queues.map((q) => q.close())).then(() => process.exit(0));
          timeout = setTimeout(() => process.exit(1), 30 * 1000);
        }
      });
    });
  })
  .parse(process.argv);
